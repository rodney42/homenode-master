var SSDP        = require('node-ssdp').Server;
var log         = require('./log.js')('homenode-master');

module.exports.start = function(config) {
  var server = new SSDP({
      //unicastHost: '192.168.11.63',
      location: "http://"+require('ip').address() + ':'+config.port
    })

  server.addUSN('upnp:rootdevice')
  server.addUSN('urn:homenode:device:Master:1')

  server.on('advertise-alive', function (heads) {
    console.log('advertise-alive', heads)
    // Expire old devices from your cache.
    // Register advertising device somewhere (as designated in http headers heads)
  })

  server.on('advertise-bye', function (heads) {
    console.log('advertise-bye', heads)
    // Remove specified device from cache.
  })

  // start server on all interfaces
  server.start('0.0.0.0')
  log.info("SSPD Server start");
}
