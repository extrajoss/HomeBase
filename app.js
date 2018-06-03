var express = require('express'),
  http = require('http'),
  https = require('https'),
  path = require('path'),
  fs = require('fs');
var config = require('./common/config');
var logger = require('morgan');
var bodyParser = require('body-parser');
var socketIO = require('socket.io');
var flash = require('connect-flash');
var session = require('express-session');
var cookie = require('cookie-parser');
var app = express();

console.log('app:' + app + ', config: ' + app.configure);
app.set('port', process.env.PORT || config.get('port'));
app.set('https_port', process.env.HTTPS_PORT || config.get('https_port'));
app.set('view engine', 'ejs');

var setup = function(remotes, routeMap, staticsMap) {
  try {

    var get_https_config = function() {
      if (!(config.get('https_port') && config.get('ssl_key') && config.get(
          'ssl_cert'))) {
        return false;
      }
      var result = {};
      result.port = config.get('https_port');
      result.key = config.get('ssl_key');
      result.cert = config.get('ssl_cert');
      return result;
    }

    remotes && console.log('in setup: ' + remotes + ", " + Object.keys(
      remotes));

    var server = null;
    var port = app.get('port');
    var development_domain = config.get('development').domain
    var development_port = config.get('development').port
    var production_domain = config.get('production').domain
    var production_port = config.get('production').port
    if (development_domain && development_port && production_domain &&
      production_port) {
      var proxy = require('redbird')({
        port: app.get('port')
      });
      let developmentServer = ['http://localhost:', development_port].join('');
      console.log("Proxying from host:" + port + " to " +
        developmentServer);
      proxy.register([development_domain, port].join(":"), developmentServer);

      let productionServer = ['http://localhost:', production_port].join('');
      console.log("Proxying from " + production_domain + ":" + port + " to " +
        productionServer);
      proxy.register([production_domain, port].join(":"), productionServer);
      port = production_port
    }

    var https_config = get_https_config();
    if (https_config) {
      httpProxy.createServer({
        target: {
          host: 'localhost',
          port: port
        },
        ssl: {
          key: fs.readFileSync(https_config.key, 'utf8'),
          cert: fs.readFileSync(https_config.cert, 'utf8')
        }
      }).listen(https_config.port);
    }
    server = http.createServer(app);
    var io = socketIO(server);
    server.listen(port, function() {
      console.log("Express server listening on port " + port);
    });

    io.on('connection', function(socket) {
      var socketThat = this;
      console.log('a user connected');
      remotes && Object.keys(remotes).forEach(function(remoteKey) {
        socket.on(remoteKey, function() {
          console.log('user called remoteKey');
          remotes[remoteKey].apply(socketThat, arguments);
        });

      });

      socket.on('disconnect', function() {
        console.log('user disconnected');
      });
      socket.emit('remoteDictionary', Object.keys(remotes));
    });

    app.set('view options', {
      layout: false
    });
    if (routeMap) {
      Object.keys(routeMap).forEach(function(key) {
        app.get(key, routeMap[key]);
      });
    }

    app.use(logger('dev'));
    app.use(bodyParser.json({
      limit: '10mb'
    }));
    app.use(bodyParser.urlencoded({
      limit: '10mb',
      extended: true
    }));
    app.use(cookie());
    app.use(session({
      secret: 'FBiA',
      resave: true,
      saveUninitialized: true
    }));
    app.use(flash());
    app.use(express.static(path.join(config.get('BasePath'), '/public'), {
      maxAge: 3600000
    }));
    if (staticsMap) {
      Object.keys(staticsMap).forEach(function(key) {
        app.use(key, express.static(staticsMap[key], {
          maxAge: 3600000
        }));
      });
    }

    app.set('views', config.get('BasePath') + '/views');
    return app;
  } catch (err) {
    console.log('error occurred during setup of Base app.' + err.stack)
    return 0;
  }
}

module.exports.setup = setup;
module.exports.expressApp = app;