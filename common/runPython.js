var sys = require('sys')
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var fs = require('fs');
var Promise = require('es6-promise').Promise;

module.exports = function (script, args, output) {
	var outStream = fs.createWriteStream(output, {flags: 'w'});
	console.log('created outstream');
	return new Promise(function (resolve, reject) {
		var allArgs = [script];
		allArgs = allArgs.concat(args);
		console.log('about to spawn: ' + allArgs);
		var pythonScriptProcess = spawn('python', allArgs);
		pythonScriptProcess.stdout.pipe(outStream);
		pythonScriptProcess.on ('close', function (code) {
		console.log('completed spawn: ' + code);
			resolve(code);
		})
		pythonScriptProcess.on ('error', function (code) {
		console.log('error on spawn: ' + code);
			reject(code);
		})
	})
}
