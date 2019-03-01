#!/usr/bin/env node

const fs = require('fs')
const neatLog = require('neat-log')
const path = require('path')
const program = require('commander')
const mirrorViaHttp = require('./server/dat-http-mirror')
const express = require('express')
const seed = require('./server/seed-dat')
const { view } = require('./server/components')
const connect = require('./server/connect')
const config = require('./server/config')()
const dataFile = require('./data-file-path')
const { throttle } = require('throttle-debounce')
program
  .option('-p, --port [port]', 'Port to start on', 3002)
  .option('-d, --cachedir [cachedir]', "Directory of dat cache", dataFile('dat-mirror-seeds'))
  .parse(process.argv)

const cache = program.cachedir
if (!fs.existsSync(cache)){
    fs.mkdirSync(cache);
}

const app = express()

const ui = neatLog(view, {
  fullscreen: true
})
ui.use(serve)

async function serve(state, bus) {
  state.currentlyHosted = []
  state.mirrorKey = config.mirrorKey
  state.httpPort = program.port
  const change = () => bus.emit('render')

  const connection = connect(config.mirrorKey)
  connection.on("mirror", async (opts) => {
    const dir = path.join(cache, opts.datKey)
    const datInfo = await seed(dir)
    const httpInfo = await mirrorViaHttp(app, dir, opts)
    const emitSyncStateThrottled = throttle(500, () => {
      connection.emit('syncState', {
        datKey: datInfo.address,
        percent: datInfo.syncPercent
      })
    })
    datInfo.on('change', function() {
      change()
      emitSyncStateThrottled()
    })
    state.currentlyHosted.push({
      datKey: datInfo.address,
      dat: datInfo,
      http: httpInfo
    })
    change()
  })
  change()
}

app.listen(program.port)