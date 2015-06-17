var fs = require('fs');
var config = require ('./config');
var logger;

if (fs.readdirSync) {
	
	var winston = require('winston');

	logger = new (winston.Logger)({
	  transports: [
	//    new (winston.transports.Console)({ json: false, timestamp: true }),
	    new winston.transports.File({ filename: config.get('BasePath') + '/log/debug.log', json: false })
	  ],
	  exceptionHandlers: [
	    new (winston.transports.Console)({ json: false, timestamp: true }),
	    new winston.transports.File({ filename: config.get('BasePath') + + '/log/exceptions.log', json: false })
	  ],
	  exitOnError: false
	});

}
else {
	logger = {
			debug: console.log,
			info: console.log,
			error: console.log
	};
}

module.exports = logger;