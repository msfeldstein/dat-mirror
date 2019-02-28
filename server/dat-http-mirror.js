const fs = require('fs').promises
const path = require('path')
const express = require('express')
const routeSubdomain = require('express-subdomain')
const serveIndex = require('serve-index')

module.exports = async function mirrorViaHttp(expressApp, dir, opts) {
  const fullpath = dir
  const stat = await fs.lstat(fullpath)
  const subdomain = opts.subdomain
  if (stat.isDirectory()) {
    const info = {
      subdomain,
      active: true
    }
    if (subdomain) {
      const router = express.Router()
      router.use('/', express.static(fullpath), serveIndex(fullpath, {icons: true}))
      expressApp.use(routeSubdomain(subdomain, router))
      // Do nothing, just means there's no config available
    }
    expressApp.use('/' + dir, express.static(fullpath), serveIndex(fullpath, {icons: true}))
    return info
  }
  return {
    active: false
  }
}