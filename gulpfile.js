var gulp = require('gulp');
var path = require('path');
var webserver = require('gulp-webserver');
var print = require('gulp-print');
var tap = require('gulp-tap');
var exec = require('gulp-exec');
var cached = require('gulp-cached');

gulp.task('webserver',function() {
  return gulp.src('./')
    .pipe(webserver({
      livereload: true,
      host: '0.0.0.0',
      port: '8000',
      open: true,
      directoryListing: true
    }));
});

gulp.task('pandoc', function() {
  return gulp.src('./src/*.impress.md')
    //.pipe(cached('pandoc'))
    .pipe(tap(function(file,t) {
      var filename = path.basename(file.path);
      var title = filename.split(/\.(?=[^.]+$)/)[0];
      title = title.split(/\.(?=[^.]+$)/)[0];
      console.log('title: '+title);
      var html = title+'.html';
      var css = title+'.css';
      var pdf = title+'.pdf';
      gulp.src('./')
        .pipe(exec('pandoc --template ./src/impress/template.html -V title='+title+' -s -t html5 --section-divs -o ./src/'+html+' ./src/'+title+'.impress.md'))
        .pipe(print(function(filepath) {
          return "made " + html;
        }))
        .pipe(exec('[ ! -e ./src/'+css+' ] && cp ./src/impress/template.css ./src/'+css))
        .pipe(print(function(filepath) {
          return "made " + css;
        }))
        .pipe(print(function(filepath) {
          return 'making'+pdf;
        }))
        .pipe(exec('[ -e ./src/'+pdf+' ] && rm ./src/'+pdf))
        .pipe(exec('./decktape-1.0.0/phantomjs ./decktape-1.0.0/decktape.js impress ./src/'+html+' ./src/'+pdf))
        .pipe(print(function(filepath) {
          return "made "+pdf;
        }));
    }));
});

gulp.task('watch', function() {
  gulp.watch(['./src/*.impress.md'],['pandoc']);
  gulp.src('gulpfile.js');
});

gulp.task('default', ['watch', 'webserver','pandoc']);
