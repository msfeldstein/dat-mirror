const discovery = require('discovery-swarm')
const multifeed = require('multifeed')
const hypercore = require('hypercore')
const pump = require('pump')
const EventEmitter = require('events')
const constants = require('../constants')
const dataFilePath = require('../data-file-path')

// Connects to a hypercore multifeed and emits 'mirror' events for any
// existing dat mirrors, or new ones as they appear
module.exports = function(key) {
  const ee = new EventEmitter()
  const swarm = discovery()

  var multi = multifeed(hypercore, dataFilePath('dat-mirror-db'), {
    valueEncoding: 'json'
  })

  multi.writer('local', (err, serverFeed) => {
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
        if (data.type == constants.ADD_MIRROR && !datsMirrored[data.datKey]) {
          ee.emit("mirror", {
            datKey: data.datKey,
            subdomain: data.subdomain
          })
          datsMirrored[data.datKey] = true
          // Send confirmation to clients
          serverFeed.append({
            type: constants.CONFIRM_MIRROR,
            datKey: data.datKey,
            subdomain: data.subdomain
          })
        }
      })
    })
  })
  
  return ee
}
