#!/usr/bin/env node
var program = require('commander')

program
  .version('1.0.0')
  .command('share <dat>', 'Tell the server to sync and share a dat')
  .command('config', 'Set a new mirror key for the client to use')
  .command('serve', 'Start a dat-mirror server, and listen for dats to share', {isDefault: true})
  .parse(process.argv)