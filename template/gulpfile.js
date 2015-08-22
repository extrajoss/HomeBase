var gulp = require('gulp');

// define plug-ins
var flatten = require('gulp-flatten');
var gulpFilter = require('gulp-filter');
var uglify = require('gulp-uglify');
var minifycss = require('gulp-minify-css');
var rename = require('gulp-rename');
var mainBowerFiles = require('main-bower-files');
var inject = require('gulp-inject');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var rimraf = require('rimraf'); // rimraf directly
// Define paths variables
var dest_path =  './www';
// grab libraries files from bower_components, minify and push in /public
gulp.task('publish-components', function() {

        var jsFilter = gulpFilter(['jquery.js', '*.js', '!*.min.js']);
        var cssFilter = gulpFilter('*.css');
        var fontFilter = gulpFilter(['*.eot', '*.woff', '*.svg', '*.ttf']);
        var jsTarget = gulp.src('./views/jsinclude.ejs');
        var cssTarget = gulp.src('./views/styles.ejs');
        var jsOutput = dest_path + '/js/';
        var cssOutput = dest_path + '/css';
        var fontOutput = dest_path + '/font';
        gulp.src(mainBowerFiles())

        // grab vendor js files from bower_components, minify and push in /public
        .pipe(jsFilter)
        .pipe(concat("concat.js"))
        .pipe(gulp.dest(jsOutput) )
//        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
//        .pipe(sourcemaps.write()) 
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(gulp.dest(jsOutput))
        .pipe(jsFilter.restore())

        // grab vendor css files from bower_components, minify and push in /public
        .pipe(cssFilter)
        .pipe(gulp.dest(cssOutput))
        .pipe(minifycss())
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(gulp.dest(cssOutput))
        .pipe(cssFilter.restore())

        // grab vendor font files from bower_components and push in /public
        .pipe(fontFilter)
        .pipe(flatten())
        .pipe(gulp.dest(fontOutput));

        var jsSources = gulp.src("./js/**/*.min.js", {read: false, cwd: __dirname + '/www'});
        var cssSources = gulp.src("./css/**/*.min.css", {read: false, cwd: __dirname + '/www'} );

        jsTarget.pipe(inject(jsSources))
            .pipe(gulp.dest('./views'));
        cssTarget.pipe(inject(cssSources))
            .pipe(gulp.dest('./views'));
});

/** 
 * Clean
 * 
 */
gulp.task('clean', function (cb) {
    rimraf('./www', cb);
});
