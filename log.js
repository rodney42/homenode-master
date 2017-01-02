
var out = function out(area, msg) {
  console.log(area + "\t: " + new Date().toISOString() + " : " + msg);
}

module.exports = logger;
function logger(area) {
  return {
    info : function(msg) {out(area,msg)},
    trace : function(msg) {out(area,msg)},
    debug : function(msg) {out(area,msg)},
    error : function(msg) {out(area,msg)},
    obj : function(input) {
      for( var p in input ) {
        //if( ! (typeof input[p] === 'function' ) ) {
          out(area, p+':'+input[p]);
        //}
      }
    }
  }
}
