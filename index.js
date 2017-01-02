var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
app.use(bodyParser.json());
var http        = require('http').Server(app);
var log         = require('./log.js')('homenode-master');
var api		      = require('node-express-yourself');
var nodekeeper  = require('./services/nodekeeper.js')(api,app);
var ssdp        = require('./ssdp-advertise.js');

var config = {
  port : 9188
}
http.listen(config.port);
ssdp.start(config);
log.info('Homenode master node started and listening on port '+config.port);
