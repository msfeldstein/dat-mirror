#!/usr/bin/env node

const term = require('terminal-kit').terminal
const Dat = require('dat-node')
const fs = require('fs')
const jayson = require('jayson');
const commandLineArgs = require('command-line-args')
const opts = commandLineArgs({
  name: 'port',
  alias: 'p',
  type: Number,
  defaultValue: 3002
})

const Bonjour = require('bonjour')()

Bonjour.publish({
  name: 'Dat Mirror',
  type: 'dat',
  port: opts.port
})

const currentlyHosted = []
const updateDisplay = () => {
  term.clear()
  console.log("Currently Hosting:")
  currentlyHosted.forEach(seedInfo => {
    let glyph = seedInfo.active ? '👍' : '🙏'
    if (seedInfo.error) {
      glyph = '👎'
    }
    console.log(`${glyph} - ${seedInfo.address}`)
    if (seedInfo.error) {
      console.log(` -- ${error}`)
    }
  })
}


const directories = fs.readdirSync('./seeds')
console.log("Directories", directories)
directories.forEach(dir => {
  currentlyHosted.push(seed(dir))
})
updateDisplay()

function seed(addr, callback) {
  const seedingInfo = {
    address: addr,
    connected: [],
    active: false,
    error: null,
    accessedBy: []
  }
  console.log("Seeding ", `./seeds/${addr}`)
  Dat(`./seeds/${addr}`, {
    key: addr
  }, function (err, dat) {
    if (err) {
      seedingInfo.error = err
      updateDisplay()
      callback(err, false);
    }
    seedingInfo.active = true
    updateDisplay()
    dat.joinNetwork()
    if (callback)
      callback(null, true);
  })
  return seedingInfo
}

// create a server
var server = jayson.server({
  mirror: function(args, callback) {
    console.log(args)
    const addr = args[0]
    seed(addr, callback)
    currentlyHosted.push(seed(addr, callback))
  }
});

server.http().listen(opts.port);