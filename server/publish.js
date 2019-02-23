module.exports = function(port) {
  const Bonjour = require('bonjour')()
  Bonjour.publish({
    name: 'Dat Mirror',
    type: 'dat',
    port: port
  })  
}
