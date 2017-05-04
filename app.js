/**
 * Module dependencies.
 */
var express = require('express'), http = require('http'), path = require('path'), fs = require('fs');
var config = require('./common/config');
var logger = require('morgan');
var bodyParser = require('body-parser');
var socketIO = require('socket.io');

// var expiry = require('static-expiry');

var app = express();

// http://www.hacksparrow.com/express-js-logging-access-and-errors.html
// var access_logfile = fs.createWriteStream('log/access.log', {flags: 'a'});
console.log('app:' + app + ', config: ' + app.configure);
app.set('port', process.env.PORT || config.get('port'));
// Switched to EJS engine - see http://stackoverflow.com/questions/4600952/
// Info on EJS ('Embedded JavaScript templates') -
// https://github.com/visionmedia/ejs
app.set('view engine', 'ejs');
// app.use(express.favicon(config.get('BasePath') +
// '/public/images/favicon.ico'));
// app.use(express.logger('dev'));

var setup = function(remotes, routeMap, staticsMap) {
	try {

		console.log('in setup: ' + remotes + ", " + Object.keys(remotes));
		// app.configure('development', function(){
		var server = null;

		// app.configure('development', function(){
		var server = null;

		server = http.createServer(app);
		var io = socketIO(server);
		server.listen(app.get('port'), function() {
			console.log("Express server listening on port " + app.get('port'));
		});

		io.on('connection', function(socket) {
			var socketThat = this;
			console.log('a user connected');
			Object.keys(remotes).forEach(function(remoteKey) {
				socket.on(remoteKey, function() {
//					var args = JSON.parse(data);
//					args.push(callback);
					console.log('user called remoteKey');
					remotes[remoteKey].apply(socketThat, arguments);
				});

			});
			
			socket.on('disconnect', function() {
				console.log('user disconnected');
			});
			socket.emit('remoteDictionary', Object.keys(remotes));
		});

		// Disable layout - http://stackoverflow.com/questions/4600952/
		app.set('view options', { layout : false
		});
		if (routeMap) {

			Object.keys(routeMap).forEach(function(key) {
				app.get(key, routeMap[key]);
			});
		}

		// app.use(express.errorHandler());
		app.use(logger('dev'));
		// app.use(bodyParser());
		app.use(bodyParser.json({ limit : '10mb'
		}));
		app.use(bodyParser.urlencoded({ limit : '10mb',
		extended : true
		}));
		// app.use(express.methodOverride());
		// app.use(express.cookieParser('your secret here'));
		// app.use(express.session());
		app.use(express.static(path.join(config.get('BasePath'), '/public'),
				{ maxAge : 3600000
				}));
		if (staticsMap) {

			Object.keys(staticsMap).forEach(function(key) {
				app.use(key, express.static(staticsMap[key], { maxAge : 3600000
				}));
			});
		}

		// app.use(logger({stream: access_logfile }));
		app.set('views', config.get('BasePath') + '/views');
		return app;
	} catch (err) {
		console.log('error occurred during setup of Base app.' + err.stack)
		return 0;
	}

}

module.exports.setup = setup;
module.exports.expressApp = app;
