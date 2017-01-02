var log         = require('../log.js')('nodekeeper');
var http        = require('http');

module.exports = init;

var nodes = [];
var masterid = 'master';

function findNode(id) {
  for( var n=0; n<nodes.length; n++) {
    if( nodes[n].id==id ) return nodes[n];
  }
  return null;
}

function init(api,app) {

  var refreshNode = function(node) {
    http.get(node.url+'/node/devices', function(res) {
      log.info("Refreshing node " + node.name);
      res.setEncoding('utf8');
      var data = '';
      res.on('data', function (chunk) {
        data += chunk;
      });
      res.on('end', function() {
        var devices = JSON.parse(data);
        node.devices = devices;
        //log.obj(devices);
      });
      res.resume();
    })
    .on('error', function(e) {
      log.error("Refresh node error "+e);
    });
  }

  var registerNode = function(req,res) {
    var id = req.query.id;
    if( !id ) {
      throw new Error('id not set');
    }
    var node = findNode(id);
    if(!node) {
      node = {
        id : id,
        registration : new Date(),
      };
      nodes.push(node);
      log.info('Registered new node with id '+id);
    } else {
      log.info('Node with id '+id+' was already registered.');
    }

    node.hostname = req.hostname;
    node.port = req.query.port;
    node.name = req.query.name;
    node.url = 'http://'+req.hostname+':'+req.query.port;

    //logObject(req);
    var masterInfo = {
      id : masterid,
      name : 'Mastername'
    }
    res.send(masterInfo);

    refreshNode(node);

  };

  var listNodes = function(req,res) {
    res.send(nodes);
  }

  var notify = function(req,res) {
    //log.info('Notify '+req);
    log.obj(req.body);
    var payload = req.body;
    log.obj(payload);
    log.info('Notify type '+payload.type);

    res.sendStatus(200);
  }

  var checkNode = function(node) {
    http.get(node.url+'/node/heartbeat?id='+masterid, function(res) {
      log.trace('STATUS: ' + res.statusCode);
      if( res.statusCode == 200 ) {
        log.trace("Heartbeat for node " + node.name+" ok.");
        node.lastCheck = new Date();
      } else {
        nodes.pop(node);
      }
      res.resume();
    })
    .on('error', function(e) {
      log.info("Heartbeat node error "+node.name+" "+e);
      nodes.pop(node);
    });
  }
  var checkNodes = function() {
    nodes.forEach( checkNode );
  }

  var def = {
    keeper : {
      endpoints : {
        register : {
          method : 'GET',
          description : 'Register a new node',
          use : registerNode
        },
        list : {
          path : '',
          description : 'List registered nodes',
          use : listNodes
        },
        notify : {
          method : 'POST',
          path : 'notify',
          description : 'Notify about a device change or device event',
          use : notify
        }
      }
    }
  }

  // Enable REST endpoints
  api.use(app,def);

  setInterval(checkNodes, 5000);
}
