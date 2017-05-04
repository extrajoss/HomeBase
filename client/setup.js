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
	var socket = io();
	socket.on('remoteDictionary', function (remoteNames) {
		console.log('remoteNames: ', remoteNames, true);
		var remotes = {};
		
		remoteNames.forEach(function (remoteName) {
			remotes[remoteName] = function() {
				console.log('calling: ', remoteName, arguments);
				var methodArgs = [remoteName];
				for (i = 0; i < arguments.length; i++) {
					methodArgs.push(arguments[i]);
				}

				socket.emit.apply(socket, methodArgs);
			}
		});
		console.log(remotes);
		callback(remotes, new RemotePromise(remotes));

	});
}

module.exports = setup;