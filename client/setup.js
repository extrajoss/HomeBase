var dnode = require('dnode');
var shoe = require('shoe');
var Promise = require('es6-promise').Promise;

var initialised = false;

var RemotePromise = function (remote) {
	var that  = this;
	Object.keys(remote).forEach(function (key) {
		that[key] = function () {
			var i;
			var methodArgs = [];
			for (i = 0; i < arguments.length; i++) {
				methodArgs.push(arguments[i]);
			}
			var promise =  new Promise (function (resolve, reject) {
				methodArgs.push(function () {
					resolve(arguments);
				});
				remote[key].apply(remote, methodArgs);
			});
			return promise;
		};
	});
}


var setup = function (callback) {
  var stream = shoe('/dnode');
  try {
    var dnodeConnection = dnode();
    dnodeConnection.on('event', function(event) {
    	
    });
    dnodeConnection.on('end', function(end) {
      console.log("dnodeConnection LOST! Will retry in 1 second. " + end);
      initialised = false;
      setTimeout(function () {setup(callback)}, 1000);
    });
    dnodeConnection.on('error', function(end) {
      console.log("dnodeConnection ERROR! Will retry in 1 second. " + end.stack);
      initialised = false;
      setTimeout(function () {setup(callback)}, 1000);
    });
    dnodeConnection
    .on(
        'remote', 
				function(remote) {
					if (initialised) {
						console.debug("domready.ready called again!");
						return;
					}
					console.log("nowjs socket connection is ready");								

					initialised = true;

					if (!window.console)
						console = {
							log : function() {
							}
					};
					callback(remote, new RemotePromise(remote));
				});
    dnodeConnection.pipe(stream).pipe(dnodeConnection);     
  } catch (error) {
    alert('Error setting up dnode.ready(). Will retry in 10 seconds: ' + error.message);
    setTimeout(setup, 10000);
  }

}

module.exports = setup;