
var sys = require('sys')
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var fs = require('fs');
var Promise = require('es6-promise').Promise;
var runCommand = require('./runCommandLine');

module.exports = function (script, args, output) {
    return runCommand ('python' [script].concat(args));
}
