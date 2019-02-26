#!/usr/bin/env node
var program = require('commander')
var http = require('http')
var discovery = require('discovery-swarm')
var hypercore = require('hypercore')
var multifeed = require('multifeed')
var pump = require('pump')
var getConfig = require('./client/config')
const homedir = require('os').homedir()
const path = require('path')

program
  .version('1.0.0')
  .usage('<dat>')
  .action(function(dat) {
    program.dat = dat
  })
  .parse(process.argv)

async function run() {
  const config = await getConfig()

  const dat = program.dat

  if (dat.length != 64) {
    throw "Need a 64 char dat address"
  }

  var multi = multifeed(hypercore, path.join(homedir, 'dat-mirror-client.db'), {
    valueEncoding: 'json'
  })

  var swarm = discovery()
  console.log("Create discovery")

  multi.writer('local', (err, feed) => {
    console.log("Writer feed ready, joining", config.mirrorKey)
    swarm.join(config.mirrorKey)
    swarm.on('connection', function (connection) {
      console.log('Found remote peer')
      pump(connection, multi.replicate({ live: true }), connection)
    })
    console.log("Appending")
    feed.append({
      type: 'add-mirror',
      datKey: dat
    })
  })

}
run()
