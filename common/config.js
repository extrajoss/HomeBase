var fs = require('fs');
var path = require('path');

var configFile = __dirname + '/../../site.json';
var configJSON = fs.readFileSync(configFile);
var config = JSON.parse(configJSON);



config['BasePath'] = path.normalize(__dirname + "/../..");
config['ApplicationName'] = path.basename(config['BasePath']);

module.exports.get = function(key) {
	return config[key];
}

module.exports.set = function(key, value) {
	config[key] = value;
}