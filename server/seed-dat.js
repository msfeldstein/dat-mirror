const path = require('path')
var Dat = require('dat-node')
const EventEmitter = require('events')

class DatInfo extends EventEmitter {
  constructor(addr) {
    super()
    this.address = addr
    this.connected = 0
    this.active = false
    this.error = null
    this.accessedBy = []
  }
}

module.exports = async function seed(dir) {
  const addr = path.basename(dir)
  const seedingInfo = new DatInfo(addr)
  try {
    Dat(dir, {
      key: addr
    }, function(err, dat) {
      seedingInfo.active = true
      seedingInfo.emit('change')
      dat.joinNetwork()
      dat.trackStats()
      dat.stats.on('update', () => {
        seedingInfo.connected = dat.stats.peers.total
        seedingInfo.emit('change')
      })
    })
  } catch (err) {
    seedingInfo.error = err
  }
  return seedingInfo
}