var Promise = require('es6-promise').Promise;
var connector = require('./connector');
var fs = require('fs');
var runCommandLine = require('./runCommandLine');
var rmdir = require('rimraf');
var common_utils = require('homebase/common/common_utils');


var loadData = function (dataFilePath, args) {
	return connector.queryPromise('SET autocommit=0;SET sql_log_bin=0; SET unique_checks=0;SET foreign_key_checks=0;', null, {multipleStatements: true})
	.then (function () {
		sql = "LOAD DATA LOCAL INFILE '" + dataFilePath + "' INTO TABLE " + args.database + ".`" + args.tablename + "`";
		if (args.ignoreLines) {
			 sql += " IGNORE " + args.ignoreLines + " LINES";
		}

		sql += ";";
		
		return connector.queryPromise(sql)
	}).then (function () {
		return connector.queryPromise('commit; SET autocommit=1; SET sql_log_bin=1; SET unique_checks=1;SET foreign_key_checks=1;', null, {multipleStatements: true});
	});
}

var split = function (dataFilePath, args) {
    var dir = args.tmpDir + "/splitFiles";
    return new Promise(function (resolve, reject) {
        rmdir(dir, function (error ) {
            fs.mkdirSync(dir);
            resolve();
        })  
    }).then(function (resolve, reject) {

        return runCommandLine('split', ['-l','1000000', dataFilePath, dir + "/" + dataFilePath]);
    }).then (function (output) {
        return new Promise(function (resolve, reject) {
            
            fs.readdir(dir, function(err, list) {
                resolve(list);
            });
        })
 
    });
    
}

module.exports = function (dataFilePath, args) {
    stats = fs.statSync(dataFilePath);
    var fileSizeInBytes = stats['size'];
    
    // split if bigger than 20 Mb and tmp dir defined
    if (fileSizeInBytes > 1024 * 1024 * 20 && args.tmpDir) {
        return split(dataFilePath, args).then(function (list) {
            var promises = list.map(function (filename) {
                return function () {
                  return loadData(filename, args);  
                };
            }) ;
            return common_utils.promiseWaterfall(promises, null, true);
        }) 

    }
    else {
        return loadData(dataFilePath, args);
    }
}
