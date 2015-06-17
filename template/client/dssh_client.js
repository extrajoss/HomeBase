var domready = require('domready');
var clientSetup = require('../Base/client/setup');
var Promise = require('es6-promise').Promise;



var DSSH = {};
domready(function () {
	
	clientSetup(function (remote, remotePromise) {
		DSSH.remote = remote;
		DSSH.remotePromise = remotePromise;

		DSSH.remotePromise.test().then(function (ret) {
			console.log('returned! : ' + ret);
		}).catch(function (err) {
			console.log("error occurred: " + err);
		});
	});
});
