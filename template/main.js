var routes = require('./routes'); 
var app = require('./Base/app'); 

var express = require('./Base/node_modules/express');
var config = require('./Base/common/config');
//var config = require('./Base/common/config');

var routeMap = {
		'/': routes.home_page
};

var remotes = {
//    getMatrix : hichord.getMatrix 
};

var statics = {
//		'/data' : config.get('dataDir')
}

app.setup(remotes, routeMap, statics);
