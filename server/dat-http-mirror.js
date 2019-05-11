const fs = require('fs')
const { promisify } = require('util')
const path = require('path')
const express = require('express')
const routeSubdomain = require('express-subdomain')
const serveIndex = require('serve-index')
const lstat = promisify(fs.lstat)

module.exports = async function mirrorViaHttp(expressApp, dir, opts) {
  const fullpath = dir
  const stat = await lstat(fullpath)
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