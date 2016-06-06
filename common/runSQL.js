var Promise = require('es6-promise').Promise;
var connector = require('./connector');
var fs = require('fs');
var ejs = require('ejs');
var common_utils = require('./common_utils'); 


module.exports = function (template, args, connectionArgs) {
//	console.log('starting: ' + template);
	return loadSQL(template, args).then (function (sql) {
//		console.log('sql: ' + sql);
		return connector.queryPromise(sql, null, connectionArgs);
	}).catch(function (err) {
		console.log('error loading template: ' + template + ", " + err.stack);
	});
}


var loadSQL = function (template, args) {
	return new Promise(function (resolve, reject) {
//		console.log('running SQL: ' + template + ", args: " + JSON.stringify(args)	);
	    ejs.renderFile(templateData, args, function (err, templateData) {
			if (err) {
				console.log('error: ' + err);
				return reject (err);
			}
			resolve(templateData);
		});
	});	
}

module.exports.serial = function (template, args, connectionArgs) {
	return loadSQL(template, args).then (function (sql) {
		var fragments = sql.split(';');
//		console.log('sql: ' + sql);
		fragments = fragments.filter(function (fragment) {
			return fragment.trim().length > 0;
		})
		var fragmentPromises = fragments.map(function (fragment) {
//			console.log('frag sql: ' + fragment);
			return new Promise (function (resolve, reject) {
				return connector.queryPromise(fragment, null, connectionArgs);
			});
		});
//		console.log('about to run template: ' + template);
		return common_utils.promiseWaterfall(fragmentPromises);
	});
	
}
module.exports.loadSQL = loadSQL;