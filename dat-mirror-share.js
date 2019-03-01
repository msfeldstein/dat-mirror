#!/usr/bin/env node
var program = require('commander')
var discovery = require('discovery-swarm')
var hypercore = require('hypercore')
var multifeed = require('multifeed')
var pump = require('pump')
var getConfig = require('./client/config')
const chalk = require('chalk')
const constants = require('./constants')
const dataFile = require('./data-file-path')
const ProgressBar = require('ascii-progress')

program
  .version('1.0.0')
  .usage('<dat>')
  .option('--subdomain <subdomain>', 'Subdomain for http mirroring')
  .option('--wait', 'Wait for server to finish syncing before exiting')
  .action(function(dat) {
    program.dat = dat
  })
  .parse(process.argv)

async function run() {
  const config = await getConfig()

  const datString = program.dat
  const regex = /[0-9a-fA-F]{64}/g
  const matches = datString.match(regex)
  if (!matches || matches.length == 0) {
    console.error(chalk.red("Need a 64 char dat address"))
    process.exit(1)
  }
  const dat = matches[0]

  var multi = multifeed(hypercore, dataFile('dat-mirror-client.db'), {
    valueEncoding: 'json'
  })

  var swarm = discovery()
  console.log(`Sharing: ${chalk.green(dat)}`)
  console.log(`Server : ${config.mirrorKey}`)
  let progressBar = null
  multi.ready(feeds => {
    const listenToFeed = feed => {
      feed.createReadStream({live: true})
      .on('data', data => {
        if (data.type == constants.SYNC_PROGRESS &&
            data.datKey == dat) {
          if (!progressBar) {
            progressBar = new ProgressBar()
          }
          progressBar.update(data.percent)
          if (data.percent >= 1) {
            console.log("Dat successfully synced!")
            process.exit()
          }
        }
        if (data.type == constants.CONFIRM_MIRROR && 
            data.datKey == dat) {
          console.log("Share command synced to server!")
          if (!program.wait) {
            process.exit()  
          }
        }
      })
    }
    multi.feeds().forEach(listenToFeed)
    multi.on('feed', listenToFeed)
    multi.writer('local', (err, feed) => {
      const msg = {
        type: constants.ADD_MIRROR,
        datKey: dat,
        wait: program.wait
      }
      if (program.subdomain) {
        msg.subdomain = program.subdomain
      }
      feed.append(msg)
      console.log(`Added to local hyperlog, waiting for response from server`)

      swarm.join(config.mirrorKey)
      swarm.on('connection', function (connection) {
        console.log('Connected to peer, syncing...')
        pump(connection, multi.replicate({ live: true }), connection)  
      })
    })
       
  })

  

}
run()
