var fs = require('fs');
var path = require('path');

var appDir = path.dirname(require.main.filename);

var configFile = appDir + '/site.json';
var configJSON = fs.readFileSync(configFile);
var config = JSON.parse(configJSON);



config['BasePath'] = appDir;
config['ApplicationName'] = path.basename(config['BasePath']);

module.exports.get = function(key) {
    return config[key];
}

module.exports.set = function(key, value) {
    config[key] = value;
}