const fs = require('fs').promises
const path = require('path')
const express = require('express')
const subdomain = require('express-subdomain')
const serveIndex = require('serve-index')

module.exports = async function mirrorViaHttp(expressApp, dir) {
  const fullpath = dir
  const stat = await fs.lstat(fullpath)
  if (stat.isDirectory()) {
    const info = {
      subdomain: null,
      active: true
    }
    const jsonPath = path.join(fullpath, "dat-mirror.json")
    try {
      const jsonBuffer = await fs.readFile(jsonPath)
      const json = JSON.parse(jsonBuffer.toString())
      const router = express.Router()
      router.use('/', express.static(fullpath), serveIndex(fullpath, {icons: true}))
      expressApp.use(subdomain(json.subdomain, router))
      info.subdomain = json.subdomain
    } catch (err) {
      // Do nothing, just means there's no config available
    }
    expressApp.use('/' + dir, express.static(fullpath), serveIndex(fullpath, {icons: true}))
    return info
  }
  return {
    active: false
  }
}