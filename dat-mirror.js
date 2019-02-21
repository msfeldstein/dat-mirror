#!/usr/bin/env node
var program = require('commander')
var Bonjour = require('bonjour')()
var jayson = require('jayson');

program
  .version('1.0.0')
  .command('share <dat>', 'Tell the server to sync and share a dat')
  .command('serve', 'Start a dat-mirror server, and listen for dats to share', {isDefault: true})
  .parse(process.argv)