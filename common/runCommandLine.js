var sys = require('sys')
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var fs = require('fs');
var Promise = require('es6-promise').Promise;

module.exports = function (command, args, output) {
    args = args || [];
    output = output || process.stdout;
    var outStream = fs.createWriteStream(output, {flags: 'w'});
    return new Promise(function (resolve, reject) {
        var scriptProcess = spawn(command, args);
        scriptProcess.stdout.pipe(outStream);
        scriptProcess.on ('close', function (code) {
            resolve(code);
        })
        scriptProcess.on ('error', function (code) {
            reject(code);
        })
    })
}
