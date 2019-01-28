#!/usr/bin/env node

const term = require('terminal-kit').terminal
const Dat = require('dat-node')
const fs = require('fs')
const jayson = require('jayson');
var program = require('commander')
const homedir = require('os').homedir();

program
  .option('-p, --port [port]', 'Port to start on')
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
  term.clear()
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
  console.log("Seeding ", `${cache}/${addr}`)
  Dat(`${cache}/${addr}`, {
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

server.http().listen(program.port);