const discovery = require('discovery-swarm')
const multifeed = require('multifeed')
const hypercore = require('hypercore')
const homedir = require('os').homedir()
const path = require('path')
const pump = require('pump')
const EventEmitter = require('events')

// Connects to a hypercore multifeed and emits 'mirror' events for any
// existing dat mirrors, or new ones as they appear
module.exports = function(key) {
  const ee = new EventEmitter()
  const swarm = discovery()

  var multi = multifeed(hypercore, path.join(homedir, 'dat-mirror-db'), {
    valueEncoding: 'json'
  })
  multi.ready(() => {
    swarm.join(key)
    swarm.on('connection', (connection) => {
      pump(connection, multi.replicate({live: true}), connection)
    })
    const feeds = multi.feeds()
    // Keep track of which dats we've already emitted to dedupe
    const datsMirrored = {}
    feeds.forEach(feed => {
      feed.createReadStream({live: true})
      .on('data', data => {
        if (data.type == 'add-mirror' && !datsMirrored[data.datKey]) {
          ee.emit("mirror", {
            datKey: data.datKey
          })
          datsMirrored[data.datKey] = true
        }
      })
    })
  })
  
  return ee
}
