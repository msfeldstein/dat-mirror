#!/usr/bin/env node

const Dat = require('dat-node')
const fs = require('fs')
const path = require('path')
const program = require('commander')
const homedir = require('os').homedir();
const mirrorViaHttp = require('./dat-http-mirror')
const express = require('express')
const jsonParser = require('body-parser').json;

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


const directories = fs.readdirSync(program.cachedir)
// directories.forEach(dir => {
//   if (fs.lstatSync(path.join(program.cachedir, dir)).isDirectory()) {
//     currentlyHosted.push(seed(dir))  
//   }
// })
// updateDisplay()

function seed(addr, callback) {
  const seedingInfo = {
    address: addr,
    connected: [],
    active: false,
    error: null,
    accessedBy: []
  }
  console.log("Seeding ", `${cache}/${addr}`)
  Dat(`${cache}/${addr}`, {
    key: addr
  }, function (err, dat) {
    if (err) {
      seedingInfo.error = err
      updateDisplay()
      if (callback)
        callback(err, false);
      return
    }
    seedingInfo.active = true
    updateDisplay()
    dat.joinNetwork()
    if (callback)
      callback(null, true);
  })
  return seedingInfo
}

app.post('/_dat-mirror/share/:dat', (req, res) => {
  console.log("Share ", req.params)
  const addr = req.params.dat
  currentlyHosted.push(seed(addr, () => res.sendStatus(200)))
})

mirrorViaHttp(app, program.cachedir, express)
app.get('/', (req, res) => {
  res.send("app.get('/')")
})
app.listen(program.port, () => console.log("serving on port", program.port))