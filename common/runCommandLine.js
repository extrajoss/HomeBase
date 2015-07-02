var sys = require('sys')
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var fs = require('fs');
var Promise = require('es6-promise').Promise;

module.exports = function (command, args, output) {
    args = args || [];
    var outStream = output ? fs.createWriteStream(output, {flags: 'w'}) : process.stdout;
    return new Promise(function (resolve, reject) {
        console.log('about to spawn: ' + [command, args]);
        var scriptProcess = spawn(command, args);
        scriptProcess.stdout.pipe(outStream);
        scriptProcess.on ('close', function (code) {
            console.log('success command line: ' + [command, args] )
            resolve(code);
        })
        scriptProcess.on ('error', function (code) {
            console.log('fail command line: ' + [command, args])
            reject(code);
        })
    })
}
