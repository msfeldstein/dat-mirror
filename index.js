var Bonjour = require('bonjour')()
var jayson = require('jayson');

const commandLineArgs = require('command-line-args')
const mainDefinitions = [
  { name: 'dat', defaultOption: true }
]
const mainOptions = commandLineArgs(mainDefinitions, { stopAtFirstUnknown: true })
const dat = mainOptions.dat


const serviceLocator = Bonjour.find({
  type: 'dat'
}, function (service) {
  const ip = service.addresses[0]
  const port = service.port
  var client = jayson.client.http({
    port: port
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