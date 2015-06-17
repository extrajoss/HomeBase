


module.exports.sciFormat = function (number, places) {
	var decimalPlaces = (typeof places === 'undefined' )? 2 : places;
	if (typeof number === 'number') {
		number = number.toExponential(decimalPlaces);
	}
	return number.replace(/e(.*)$/," &times <nobr>10<sup>$1</sup></nobr>");
}


module.exports.fromSciFormat = function (sciFormat) {
	var val = sciFormat.replace(/[^\x00-\x7F]/g, "");
	val = val.replace(/  10/, "e");
	return parseFloat(val);
}

module.exports.floatFormat = function(floatNumber) {
	return parseFloat(Math.round(floatNumber * 100) / 100).toFixed(2);
}


module.exports.basePairFormat = function (val) {
	var valString = null;
	if (val > 1000000) {
		val /= 1000000;
		valString = module.exports.floatFormat(val) + " Mb";
	} else if (val > 1000) {
		val /= 1000;
		valString = module.exports.floatFormat(val) + " kb";
	} else {
		valString = val + " bp";
	}

	return valString;
}