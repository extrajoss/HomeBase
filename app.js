/**
 * Module dependencies.
 */
var express = require('express'), http = require('http'), https = require('https'), path = require('path'), fs = require('fs');

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
app.set('https_port', process.env.HTTPS_PORT || config.get('https_port'));
// Switched to EJS engine - see http://stackoverflow.com/questions/4600952/
// Info on EJS ('Embedded JavaScript templates') -
// https://github.com/visionmedia/ejs
app.set('view engine', 'ejs');
// app.use(express.favicon(config.get('BasePath') +
// '/public/images/favicon.ico'));
// app.use(express.logger('dev'));

var setup = function (remotes, routeMap, staticsMap) {
	try {

		var get_https_config = function(){
			if (!(config.get('https_port')&&config.get('ssl_key')&&config.get('ssl_cert'))){
				return false;
			}
			var result = {};
			result.port = config.get('https_port');
			result.key = config.get('ssl_key');
			result.cert = config.get('ssl_cert');
			return result;
		}
		
		console.log('in setup: ' + remotes + ", " + Object.keys(remotes));

		var server = null;
		var port = app.get('port');
		var https_config = get_https_config();
		if (https_config) {
			var options = {
				key: fs.readFileSync(https_config.key),
				cert: fs.readFileSync(https_config.cert),
				requestCert: false,
				rejectUnauthorized: false
			};
			var http_port = port;
			port = https_config.port;
			http_app = express();
			http_router = express.Router();
			http_app.use('/', http_router);
			http_router.get('*', function (req, res) {
				if (!/https/.test(req.protocol)) {
					var host = req.get('Host');
					var destination = ['https://', host, req.url].join('');
					return res.redirect(destination);
				} else {
					return next();
				}
			});
			var http_server = http.createServer(http_app);
			http_server.listen(http_port, function () {
				console.log("Express http server listening on port " + http_port);
			});
			server = https.createServer(options, app);
		} else {
			server = http.createServer(app);
		}
		var io = socketIO(server);
		server.listen(port, function () {
			console.log("Express server listening on port " + port);
		});

		io.on('connection', function (socket) {
			var socketThat = this;
			console.log('a user connected');
			Object.keys(remotes).forEach(function (remoteKey) {
				socket.on(remoteKey, function () {
					//					var args = JSON.parse(data);
					//					args.push(callback);
					console.log('user called remoteKey');
					remotes[remoteKey].apply(socketThat, arguments);
				});

			});

			socket.on('disconnect', function () {
				console.log('user disconnected');
			});
			socket.emit('remoteDictionary', Object.keys(remotes));
		});

		// Disable layout - http://stackoverflow.com/questions/4600952/
		app.set('view options', {
			layout: false
		});
		if (routeMap) {

			Object.keys(routeMap).forEach(function (key) {
				app.get(key, routeMap[key]);
			});
		}

		// app.use(express.errorHandler());
		app.use(logger('dev'));
		// app.use(bodyParser());
		app.use(bodyParser.json({
			limit: '10mb'
		}));
		app.use(bodyParser.urlencoded({
			limit: '10mb',
			extended: true
		}));
		// app.use(express.methodOverride());
		// app.use(express.cookieParser('your secret here'));
		// app.use(express.session());
		app.use(express.static(path.join(config.get('BasePath'), '/public'),
			{
				maxAge: 3600000
			}));
		if (staticsMap) {

			Object.keys(staticsMap).forEach(function (key) {
				app.use(key, express.static(staticsMap[key], {
					maxAge: 3600000
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
