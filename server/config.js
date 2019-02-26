const homedir = require('os').homedir()
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')

module.exports = function() {
  const configPath = path.join(homedir, 'dat-mirror-config.json')
  let config = null
  try {
    config = JSON.parse(fs.readFileSync(configPath).toString())
  } catch (e) {
    config = {
      mirrorKey: crypto.randomBytes(20).toString('hex')
    }
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
  }
  return config
}