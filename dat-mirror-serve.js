#!/usr/bin/env node

const fs = require('fs')
const neatLog = require('neat-log')
const path = require('path')
const program = require('commander')
const homedir = require('os').homedir();
const mirrorViaHttp = require('./server/dat-http-mirror')
const express = require('express')
const jsonParser = require('body-parser').json;
const seed = require('./server/seed-dat')
const { siteList } = require('./server/components')
const publish = require('./server/publish')

program
  .option('-p, --port [port]', 'Port to start on', 3002)
  .option('-d, --cachedir [cachedir]', "Directory of dat cache", `${homedir}/dat-mirror-seeds`)
  .parse(process.argv)

const cache = program.cachedir
if (!fs.existsSync(cache)){
    fs.mkdirSync(cache);
}

const app = express()
publish(program.port) // Advertise over discovery services
const ui = neatLog(siteList, {
  fullscreen: true
})
ui.use(serve)

async function serve(state, bus) {
  state.currentlyHosted = []
  const directories = fs.readdirSync(cache).map(d => `${cache}/${d}`)
  directories.forEach(async function(dir) {
    if (fs.lstatSync(dir).isDirectory()) {
      const datInfo = await seed(dir)
      const httpInfo = await mirrorViaHttp(app, dir)
      state.currentlyHosted.push({
        datKey: datInfo.address,
        dat: datInfo,
        http: httpInfo
      })
      bus.emit('render')
    }
  })
  bus.emit('render')
}

app.post('/_dat-mirror/share/:dat', (req, res) => {
  console.log("Share ", req.params)
  const addr = req.params.dat
  currentlyHosted.push(seed(addr, () => res.sendStatus(200)))
})

app.get('/', (req, res) => {
  res.send("app.get('/')")
})
app.listen(program.port, () => console.log("serving on port", program.port))