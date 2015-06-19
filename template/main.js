var routes = require('./routes'); 
var app = require('homebase/app'); 

var express = require('homebase/node_modules/express');
var config = require('homebase/common/config');

var routeMap = {
		'/': routes.home_page
};

var remotes = {
//    myRemoteCall : myRemoteCallOnTheServer
};

var statics = {
//		'/data' : config.get('dataDir')
}

app.setup(remotes, routeMap, statics);
