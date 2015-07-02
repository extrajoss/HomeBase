var fs = require('fs');
var util = require('util');
var crypto = require('crypto');
var Promise = require('es6-promise').Promise;

var sendFile = function(response, fullPath, filename) {
	fs.stat(fullPath, function(error, stat) {
		if (error) {
			throw error;
		}
		var rs;
		// We specify the content-type and the content-length headers
		// important!
		response.writeHead(200, {
			'Content-Type' : 'application/octet-stream',
			'Content-Disposition' : 'attachment; filename="' + filename + '"',
			'Content-Length' : stat.size
		});
		rs = fs.createReadStream(fullPath);
		// pump the file to the response
		console.log("sending file called: " + fullPath);
		util.pump(rs, response, function(err) {
			if (err) {
				throw err;
			}
		});
	});
};

var blankPanel = function(panel, isOn, message) {
	var name = panel + ' .blank';
	
	if (isOn) {
		if ($(name).length === 0) {
			console.log("blanking " + panel + ": " + isOn);
			if (message) {
				$(panel).append(
						'<div class="blank hidden"><br><p class="centered">' + message
						+ '</p></div>');

			} else {
				$(panel).append('<div class="blank hidden"></div>');
			}
			$(name).fadeIn("fast");
			$(name).css('height', $(panel).css('height'));
		}
	} else {
		console.log("blanking " + panel + ": " + isOn);
		$(name).fadeOut("slow", function(obj) {
			$(name).remove();
		});
	}

};

var toggleOverlay = function (contents) { // contents = "HTML string"
	// dim background
	if($("div.dimmer_1").length == 0) { 
		$('body').append('<div class="dimmer_1"></div><div id="overlay_1"></div>'); 
		if (contents) { 
			$("div#overlay_1").html(contents).slideToggle("slow"); 
			}
		
		$("div.dimmer_1").on( "click", function(){ 
			$("div#overlay_1").slideToggle("slow").remove();
			$("div.dimmer_1").remove();
			});
		}
	else { $("div.dimmer_1, #overlay_1").slideToggle("slow").remove(); }

};


var promiseWaterfall = function(promises, results, isLazy) {
    results = results || [];
  if (promises.length === 0) {
      return results;
  }
  var promise = promises.shift();
  if (isLazy) {
      promise = promise();
  }
  console.log('promise array: ' + promises.length);
  if (promises.length === 0) {
      return promise.then(function (val) {
          console.log('last promise finished' + promises.length + ' left!');
          results.push(val);
          return results;
      });
  }
  else {
      return promise.then(function (val) {
          console.log('promise ' + val + ' finished' + promises.length + ' left!');
          results.push(val);
         return promiseWaterfall(promises, results, isLazy); 
      });
  }
  
  return finalPromise;
};

var createMD5 = function (string) {
	
	var md5sum = crypto.createHash('md5');
	md5sum.update(string);
	

    return md5sum.digest('hex');
};


var htmlDecode = function(value) {
    return $('<div/>').html(value).text();
};

var getURLParameter = function(sParam)
{
    if (window.location.search.length > 0) {
    
      var sPageURL = window.location.search.substring(1);  // no .toLowerCase() here (this affects the value!)
      var sURLVariables = sPageURL.split('&');
      sParam = sParam.toLowerCase();
      for (var i = 0; i < sURLVariables.length; i++) 
      {
          var sParameterName = sURLVariables[i].split('=');
          if (sParameterName[0].toLowerCase() == sParam) // make name case insensitive
          {
              return decodeURIComponent(sParameterName[1]); // the value might have been encoded
          }
      }
     }
    return null;
}


module.exports.sendFile = sendFile;
module.exports.createMD5 = createMD5;
module.exports.blankPanel = blankPanel;
module.exports.toggleOverlay = toggleOverlay; 
module.exports.promiseWaterfall = promiseWaterfall;
module.exports.getURLParameter = getURLParameter;
module.exports.htmlDecode = htmlDecode;
