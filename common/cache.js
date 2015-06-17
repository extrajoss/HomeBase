//
// Simple cache with automatic removal of oldest values.
//
// Authors: Sean O'Donoghue
//
var logger = require('./log');

module.exports.cache = (function (maximum_cache_size) {
	var cache = {};
	var last_access = {};

	if (! maximum_cache_size) {maximum_cache_size = 1000};
	
	return {
		write: function(key, value) {
			var temp_key;
			last_access[key] = Date();

			// store in cache
			cache[key] = value;
			
			// if cache size is too large, remove oldest key
			var size = Object.keys(cache).length;
			logger.info('Stored ' + key + ' in cache (size = ' + size + ')');
			if (size > maximum_cache_size) {
				var oldest_key;
				var oldest_date;
				// find and delete oldest key
				oldest_date = last_access[key];
				for (temp_key in cache) {
					// console.log('checking key = ' + temp_key);
					if (last_access[temp_key] <= oldest_date) {
						//console.log('key is older: ' + last_access[temp_key]);
						oldest_key = temp_key;
						oldest_date = last_access[temp_key];
					}
				}
				// console.log('final oldest key = ' + oldest_key);
				delete cache[oldest_key];
				delete last_access[oldest_key];
				logger.info('Deleted ' + oldest_key + ' from cache');
			}
			return(value);
		},
		read: function(key, callback) {
			
			if (key in cache && cache[key]) {
				// use cached value if available
				logger.info('Read ' + key + ' from cache');
				return(cache[key]);
			} else {
				return(false);
			}
		},
		clear: function() {
			cache = {};
			last_access = {};
			
		}
	}
});

