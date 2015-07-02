var Promise = require('es6-promise').Promise;
var connector = require('./connector');



module.exports = function (dataFilePath, args) {
	return connector.queryPromise('SET autocommit=0;SET unique_checks=0;SET foreign_key_checks=0;', null, {multipleStatements: true})
	.then (function () {
		sql = "LOAD DATA LOCAL INFILE '" + dataFilePath + "' INTO TABLE " + args.database + ".`" + args.tablename + "`";
		if (args.ignoreLines) {
			 sql += " IGNORE " + args.ignoreLines + " LINES";
		}
		sql +=  " FIELDS TERMINATED BY '\\t' LINES TERMINATED BY '\\n' ";

		sql += ";";
		
		return connector.queryPromise(sql)
	}).then (function () {
		return connector.queryPromise('commit; SET autocommit=1;SET unique_checks=1;SET foreign_key_checks=1;', null, {multipleStatements: true});
	});
}
