const path = require('path')
const homedir = require('os').homedir()
const mkdirp = require('mkdirp').sync

module.exports = function dataFile(filename) {
  const dataDirectory = path.join(homedir, '.dat-mirror')
  mkdirp(dataDirectory)
  return path.join(dataDirectory, filename)
}