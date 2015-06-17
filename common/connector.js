var mysql = require('mysql');
var logger = require('./log');
var config = require('./config');
var Promise = require('es6-promise').Promise;
var stream = require('stream');


var skipStreaming = config.get('skipDBStreaming') || false;

// var cache = require('./cache');
// cache = cache.cache(1000);

// Using '?' and [params] means any special characters are automatically
// escaped, protecting against sql injection.
// In addition, multiple mysql statements per query are disabled by default;
// together, this sanitises the DB input.
// See https://github.com/felixge/node-mysql/blob/master/Readme.md

var backupMysql = null;
var args = {
    connectionLimit : 5,
		host     : config.get('dbhost'),
		user     : config.get('dbuser'),
		password : config.get('dbpassword'),
		database : config.get('database'),
	};
//console.log('sql args: '  + JSON.stringify(args));

var pool = mysql.createPool(args);

//function connectPromise() {
//	return new Promise (function (resolve) {
//		resolve(connect());
//	});
//}

//function disconnectPromise(connection) {
//	return new Promise (function (resolve, reject) {
//		connection.end(function(err) {
//			if (typeof err === undefined || err === null) {
//				resolve();
//			}
//			else {
//				reject(err);
//			}
//
//		});
//	});
//}


var actualQueryPromise = function (sql, params) {
	return function (connection) {
		return new Promise (function (resolve, reject ) {
//			console.log('about to run actual query promise: ' + sql);
			connection.query(sql, params, function (err, results) {
//				console.log('finished actual query promise: ' + results);
				if (typeof err === undefined || err === null) {
					resolve(results);
				}
				else {
					console.log('error occurred in actual query promise: ' + err);
					reject(err);
				}
			});
		});
	}

};

var directConnectAndRun = function (connectionArgs, connectionPromiseFunction) {
	return new Promise( function (resolve, reject) {
		var connection = mysql.createConnection(connectionArgs);
		
		var connectionPromise = connectionPromiseFunction(connection);
		return connectionPromise.then(function (data) {
	//		console.log('got data: '  + data);
			return resolve(data);
		}).then (function () {
			connection.end();
		}).catch(function (err) {
			console.log('error occurred in directConnectAndRun: ' + err.stack);
			connection.end();
			reject(data);
		});
	});

}

var poolConnectAndRun = function (connectionPromiseFunction) {
	var func = function (resolve, reject) {
		pool.getConnection(function(err, connection) {
			if (err) {
				console.log('error occurred in poolConnectAndRun getting the connection: ' + err.stack);
				reject (err);
			}
			var connectionPromise = connectionPromiseFunction(connection);
			return connectionPromise.then(function (data) {
//				console.log('got data: '  + data);
				return resolve(data);
			}).then (function () {
				disconnect(connection);
//				console.log('finished query connectAndRun: ' );
			}).catch(function (err) {
				console.log('error occurred in poolConnectAndRun: ' + err.stack);
				disconnect(connection);
				reject(data);
			});
		});
	};
	return new Promise (func);

}

module.exports.queryPromise = function (sql, params, extraConnectionArgs) {
	var sqlmsg = sql;
	if (sqlmsg.length > 62) {
		sqlmsg = sqlmsg.substring(0, 60) + "...";
	}
	sqlmsg = 'query: ' + sqlmsg;
//	console.time(sqlmsg);
	logger.info('sql: ' + sql + ': ' + params);
	console.log('sql: ' + sql + ': ' + params);
	
  var connectionQuery;
//	console.log(' extra: ' + extraConnectionArgs);
	if (extraConnectionArgs) {
//	console.log('in  extra: ' + extraConnectionArgs);
		// don't use the pool if extra connection args are used, as the pool doesn't know about it.
		var tempArgs = {};
		Object.keys(args).forEach(function (arg) {
			tempArgs[arg] = args[arg];
		})
		Object.keys(extraConnectionArgs).forEach(function (arg) {
			tempArgs[arg] = extraConnectionArgs[arg];
		})
		connectionQuery = directConnectAndRun(tempArgs, actualQueryPromise(sql, params));
	}
	else {
		connectionQuery = poolConnectAndRun(actualQueryPromise(sql, params));
	}
	
	return connectionQuery.then(function (results) {
//			console.timeEnd(sqlmsg);
			return results;
		}).catch(function (err) {
			console.log('err occured query promise: ' + err.stack);
//			console.timeEnd(sqlmsg);
			throw err;
		});
};

var actualQueryStreamPromise = function (sql, params) {
	return function (connection) {

		return new Promise (function (resolve, reject ) {
			var query = connection.query(sql, params);
			resolve(query.stream({highWaterMark: 50}));
		});
	}
};

module.exports.queryStreamPromiseFake = function (sql, params, rowCallback, finishedCallback) {
//  logger.info('Running fake stream query: ' + sql+ ': ' + params);
  var sqlmsg = sql;
  if (sqlmsg.length > 63) {
    sqlmsg = sqlmsg.substring(0, 60) + "...";
  }
  sqlmsg = 'querystream: ' + sqlmsg;
//  logger.info('sql: ' + sql + ': ' + params);
  console.time(sqlmsg);
  

  return this.queryPromise(sql,params).then (function (data) {
    data.forEach(function(row) {
      rowCallback(row);
    });
    console.timeEnd(sqlmsg);
    return finishedCallback();
  });
  
}

module.exports.queryStreamPromise = function (sql, params, rowCallback, finishedCallback) {


  if (skipStreaming) {
    return this.queryStreamPromiseFake(sql, params, rowCallback, finishedCallback);
  } else {

    var sqlmsg = sql;
    if (sqlmsg.length > 63) {
      sqlmsg = sqlmsg.substring(0, 60) + "...";
    }
    sqlmsg = 'querystream: ' + sqlmsg;
//    logger.info('sql: ' + sql + ': ' + params);
    console.time(sqlmsg);
	
  	return poolConnectAndRun(actualQueryStreamPromise(sql, params))
  			.then(function (readStream) {
    		logger.info('stream read : ' + readStream);
    		return new Promise(function(resolve, reject) {
    			
    			readStream
    				.on('data', function (row) {
    				rowCallback(row);})
    				.on('end', function () {
    					resolve();
    				});
    			readStream.resume();
    		});
  	}).then(function () {
  		console.timeEnd(sqlmsg);
  		return finishedCallback();
  	}).catch(function (err) {
  		console.log('err occured queryStream promise: ' + err.stack);
  		console.timeEnd(sqlmsg);
  		return finishedCallback(err);
  //		throw err;
  	});
	}
};

module.exports.setMysql = function (stub) {
	if (backupMysql === null) {
		backupMysql = mysql;
	}
	mysql = stub;
};

module.exports.restoreMysql = function () {
	if (backupMysql !== null) {
		mysql = backupMysql;
	}
}


module.exports.query = function (sql, params, callback, meta_data) {
	logger.info("query : " + sql + ", params: " + params);
	var result;
	// if (params !== null) {result = cache.read(params)};
	if (! result) {
		pool.getConnection(function(err, connection) {
			if (err !== null) {
				logger.error("Err is occurred on connection:" + err.stack);
			} else {
			  // connected! (unless `err` is set)
					
				var queryVal = connection.query(sql, params, function(err, results) {
					if (typeof err === undefined || err === null) {
						logger.info("Number of results found: " + results.length);
						if (callback != null ) {
							callback(results, meta_data);
							// cache.write(params, results);
						}
					} else {
						logger.error("error = " + err.stack);
						if (callback != null) {
							callback(err);
						}
					}
				});
				// console.log("The final query =" + queryVal.sql)
				
				disconnect(connection);
			}
		})
	} else {
		callback(result, meta_data);
	}
}

function disconnect(connection) {
	connection.release();	
}


module.exports.end = function () {
	pool.end();
}
