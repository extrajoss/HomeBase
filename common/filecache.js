var fs = require('fs');

var FileCache = function (location) {
	console.log('location: ' + location + "");
	if (!fs.existsSync(location)) {
		fs.mkdirSync(location);
	}
	this.location = location;
};

FileCache.prototype.store = function(name, data, callback) {
	data = JSON.stringify(data, null, 4);
	fs.writeFile(this.location + "/" + name, data, callback);
};

FileCache.prototype.exists = function(name) {
	var loc = this.location + "/" + name;
	console.log(' loc: ' + [loc, fs.exists(loc)]);
	return fs.existsSync(loc);
};

FileCache.prototype.get = function(name) {
	var data = fs.readFileSync(this.location + "/" + name);
	return JSON.parse(data);
};

module.exports = function (location) {
		console.log('base location: ' + location);
		return new FileCache(location);
};