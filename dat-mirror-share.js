#!/usr/bin/env node
var program = require('commander')
var Bonjour = require('bonjour')()
var resolve = require('dat-link-resolve')
var http = require('http')

program
  .version('1.0.0')
  .usage('<dat>')
  .action(function(dat) {
    program.dat = dat
  })
  .parse(process.argv)

const dat = program.dat

if (dat.length != 64) {
  throw "Need a 64 char dat address"
}

console.log("Searching for dat-mirror service...")
const serviceLocator = Bonjour.find({
  type: 'dat'
}, function (service) {
  const ip = service.addresses[0]
  const port = service.port
  console.log("posting to ", `/_dat-mirror/share/${dat}`)
  const req = http.request({
    host: ip,
    port,
    path: `/_dat-mirror/share/${dat}`,
    method: 'POST'
  }, (res) => {
    console.log("Successfully requested Mirror")
    process.exit();
  })
  req.on('error', (err) => {
    throw err
  })
  req.end()
  console.log("Found dat service ", ip, "port", port)
})