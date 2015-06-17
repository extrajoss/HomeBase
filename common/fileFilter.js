// from http://stackoverflow.com/questions/17223194/progressively-read-binary-file-in-javascript

var FileFilter = function (file, fnLineFilter, fnComplete) {
     var mx = file.size,
         BUFF_SIZE = 262144,
         i = 0,
         lineCount = 0;
     var d1 = +new Date;
     var remainder = "";

     function grabNextChunk() {

         var myBlob = file.slice(BUFF_SIZE * i, (BUFF_SIZE * i) + BUFF_SIZE, file.type);
         i++;
//         console.log('loading chunk: ' + i + ', myBlob:  ' + myBlob);
         var fr = new FileReader();

         fr.onload = function(e) {
//             console.log('on load: '  + e);
             //run line filter:
             var str = remainder + e.target.result,
//                 o = str,
                 r = str.split(/\r?\n/);
             remainder = r.slice(-1)[0];
             r.pop();
//             lineCount += r.length;
             var currentBytes = 0;
        	 var maxSize = BUFF_SIZE;
             if ((BUFF_SIZE * i) > mx) {
            	 maxSize = mx % BUFF_SIZE;
             }
             r.forEach(function (line, rowIndex) {
            	 currentBytes += line.length;
            	 lineCount++;
            	 
            	 var bufferPercent = currentBytes / maxSize;
//            	 bufferPercent = 0;
            	 var percent = (BUFF_SIZE * (i - 1) + maxSize * bufferPercent) / mx;
//                 console.log('line: ' + line + ', %:' + percent);
            	 fnLineFilter(line, 100 * percent, lineCount);
             });
//             var rez = r.map(fnLineFilter).filter(Boolean);
//             if (rez.length) {
//                 [].push.apply(collection, rez);
//             } /* end if */

             if ((BUFF_SIZE * i) > mx) {
                 fnComplete(file);
                 console.log("filtered " + file.name + " in " + (+new Date() - d1) + "ms  ");
             } /* end if((BUFF_SIZE * i) > mx) */
             else {
                 setTimeout(grabNextChunk, 0);
             }

         };
         fr.readAsText(myBlob);
     } /* end grabNextChunk() */

     grabNextChunk();
 }; /* end fileFilter() */

module.exports = FileFilter;