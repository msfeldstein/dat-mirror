#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const program = require('commander')
const homedir = require('os').homedir();
const mirrorViaHttp = require('./dat-http-mirror')
const express = require('express')
const jsonParser = require('body-parser').json;
const seed = require('./seed-dat')

const app = express()

program
  .option('-p, --port [port]', 'Port to start on', 3002)
  .option('-d, --cachedir [cachedir]', "Directory of dat cache", `${homedir}/dat-mirror-seeds`)
  .parse(process.argv)

const cache = program.cachedir

if (!fs.existsSync(cache)){
    fs.mkdirSync(cache);
}


const Bonjour = require('bonjour')()

Bonjour.publish({
  name: 'Dat Mirror',
  type: 'dat',
  port: program.port
})

const currentlyHosted = []
const updateDisplay = () => {
  console.log("Currently Hosting:")
  currentlyHosted.forEach(seedInfo => {
    console.log(seedInfo)
    let glyph = seedInfo.active ? '👍' : '🙏'
    if (seedInfo.error) {
      glyph = '👎'
    }
    console.log(`${glyph} - ${seedInfo.address}`)
    if (seedInfo.error) {
      console.log(` -- ${seedInfo.error}`)
    }
  })
}


const directories = fs.readdirSync(program.cachedir).map(d => `${program.cachedir}/${d}`)
directories.forEach(async function(dir) {
  if (fs.lstatSync(dir).isDirectory()) {
    const datInfo = await seed(dir)
    const httpInfo = await mirrorViaHttp(app, dir)
    currentlyHosted.push({
      dat: datInfo,
      http: httpInfo
    })
    console.log("Dat", datInfo, "Http", httpInfo)
  }
})
updateDisplay()

app.post('/_dat-mirror/share/:dat', (req, res) => {
  console.log("Share ", req.params)
  const addr = req.params.dat
  currentlyHosted.push(seed(addr, () => res.sendStatus(200)))
})

app.get('/', (req, res) => {
  res.send("app.get('/')")
})
app.listen(program.port, () => console.log("serving on port", program.port))