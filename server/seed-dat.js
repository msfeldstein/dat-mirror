const path = require('path')
var Dat = require('dat-node')
// Dat = require('util').promisify(Dat)
const cache = []

module.exports = async function seed(dir) {
  const addr = path.basename(dir)

  const seedingInfo = {
    address: addr,
    connected: [],
    active: false,
    error: null,
    accessedBy: []
  }
  
  try {
    const dat = Dat(dir, {
      key: addr
    }, function(err, dat) {
      cache.push(dat)
      seedingInfo.active = true
      dat.joinNetwork()
    })
    
  } catch (err) {
    seedingInfo.error = err
  }
  return seedingInfo
}