var sys = require('sys');
var utils = require('mocha/lib/utils');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var email = require('emailjs/email');
var fs = require('fs');
var moment = require('emailjs/node_modules/moment');


var child = null;

var currentError = null;

var emailList = [ [ENTER ARRAY OF EMAIL ADDRESSES TO SEND REPORTS TO LIKE 'FirstName LastName <name@place.com>' ];

var server = email.server.connect({
	user : "[enter emailaddress]",
	password : "[enter password]",
	host : "smtp.gmail.com",
	ssl : true
});

var files = utils.files('.');
console.log('Starting watching mode.');
createTestAndMail();

utils.watch(files, function(file) {
	var nowTime = moment().format("ddd, DD MMM YYYY HH:mm:ss");
	console.log('file changed in watching mode: ' + file + " at " + nowTime);
	if (child) {
		child.kill();
		child = null;
	}
	createTestAndMail(nowTime);
	child = null;
});

function createTestAndMail(nowTime) {
	nowTime = nowTime || moment().format("ddd, DD MMM YYYY HH:mm:ss");
	var createTestReport = spawn(__dirname + '/createTestReport.sh', ['test']);

	createTestReport.stderr.on('data', function(data) {
		console.log(String(data));
	});
 	createTestReport.stdout.on('error', function(data) {
		console.log(data);
		
	});
	createTestReport.stdout.on('end', function(data) {
		// convert to String
		fs.readFile(__dirname + '/public/test.html', 'utf8',
				function(err, data) {
					if (err) {
						return console.log(err);
					}
					if (data.indexOf('test fail') > -1) {

						console.log('found failure');
						if (currentError !== true) {
							currentError = true;
							var message = {
								text : 'Sending HTML',
								from : "Test Admin <test@test.org>" [ENTER TEST ADMIN EMAIL ADDRESS],
								to : emailList.join(),
								subject : "Test Failed: " + nowTime,
								attachment : [ {
									data : data,
									alternative : true
								} ]
							};
							// send the message and get a callback with an error
							// or details
							// of the message that was sent
							server.send(message, function(err, message) {
								console.log("Failure email sent to: "
										+ emailList.join());
							});
						}
					} else {
						console.log('build is good!');
						if (currentError === true) {
							currentError = false;
							var message = {
								text : 'Sending HTML',
								from : "Test Admin <test@test.org>" [ENTER TEST ADMIN EMAIL ADDRESS],
								to : emailList.join(),
								subject : "Test Fixed: " + nowTime,
								attachment : [ {
									data : data,
									alternative : true
								} ]
							};
							// send the message and get a callback with an error
							// or details
							// of the message that was sent
							server.send(message, function(err, message) {
								console.log("Fixed email sent to: "
										+ emailList.join());
							});
						}
					}
					;

				});
	});

}
