const fs = require('fs')
const crypto = require('crypto')
const dataFilePath = require('../data-file-path')

module.exports = function() {
  const configPath = dataFilePath('dat-mirror-config.json')
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