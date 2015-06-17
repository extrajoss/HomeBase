/*
 * GET home page.
 */

var fs = require('fs');
var util = require('util');

exports.home_page = function(request, callback, next){
	'use strict';
	var args = { title: 'Success'};
  callback.render('mainPage', args);
};

