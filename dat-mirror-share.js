#!/usr/bin/env node
var program = require('commander')
var Bonjour = require('bonjour')()
var jayson = require('jayson');

program
  .version('1.0.0')
  .usage('<dat>')
  .action(function(dat) {
    program.dat = dat
  })
  .parse(process.argv)

const dat = program.dat

console.log("Searching for dat-mirror service...")
const serviceLocator = Bonjour.find({
  type: 'dat'
}, function (service) {
  const ip = service.addresses[0]
  const port = service.port
  var client = jayson.client.http({
    port: port,
    host: ip
  });
  client.request('mirror', [dat], function(err, resp) {
    if (err) {
      throw err
    }
    console.log("Successfully requested Mirror")
    process.exit();
  })
  console.log("Found dat service ", ip, "port", port)

})