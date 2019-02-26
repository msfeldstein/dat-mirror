#!/usr/bin/env node

const fs = require('fs')
const neatLog = require('neat-log')
const path = require('path')
const program = require('commander')
const homedir = require('os').homedir();
const mirrorViaHttp = require('./server/dat-http-mirror')
const express = require('express')
const seed = require('./server/seed-dat')
const { view } = require('./server/components')
const connect = require('./server/connect')
const config = require('./server/config')()

program
  .option('-p, --port [port]', 'Port to start on', 3002)
  .option('-d, --cachedir [cachedir]', "Directory of dat cache", `${homedir}/dat-mirror-seeds`)
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

  const connection = connect(config.mirrorKey)
  connection.on("mirror", async (opts) => {
    const dir = path.join(cache, opts.datKey)
    const datInfo = await seed(dir)
    const httpInfo = await mirrorViaHttp(app, dir)
    datInfo.on('change', () => bus.emit('render'))
    state.currentlyHosted.push({
      datKey: datInfo.address,
      dat: datInfo,
      http: httpInfo
    })
    bus.emit('render')
  })
  bus.emit('render')
}

app.get('/', (req, res) => {
  res.send("app.get('/')")
})
app.listen(program.port)