#!/usr/bin/env node
var program = require('commander')
var discovery = require('discovery-swarm')
var hypercore = require('hypercore')
var multifeed = require('multifeed')
var pump = require('pump')
var getConfig = require('./client/config')
const homedir = require('os').homedir()
const path = require('path')
const chalk = require('chalk')
const constants = require('./constants')

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
  console.log("Share ", chalk.green(dat), "to dat-mirror server", chalk.blue(config.mirrorKey))
  
  multi.ready(feeds => {
    multi.feeds().forEach(feed => {
      feed.createReadStream({live: true})
      .on('data', data => {
        if (data.type == constants.CONFIRM_MIRROR && 
            data.datKey == dat) {
          console.log("Share command synced to server!")
          process.exit()
        }
      })
    })
    multi.writer('local', (err, feed) => {
      swarm.join(config.mirrorKey)
      swarm.on('connection', function (connection) {
        console.log('Connected to peer, syncing...')
        pump(connection, multi.replicate({ live: true }), connection)
        console.log(`Added ${chalk.green(dat)} to hyperlog, run dat-mirror sync if the share command doesn't finish successfully`)
        feed.append({
          type: constants.ADD_MIRROR,
          datKey: dat
        }) 
      })
    })
       
  })

  

}
run()
