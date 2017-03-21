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
      var css = title+'.css';
      gulp.src('./')
        .pipe(exec('pandoc --template ./src/impress/template.html -V title='+title+' -s -t html5 --section-divs -o ./src/'+title+'.html ./src/'+title+'.impress.md'))
        .pipe(exec('if [ ! -e ./src/'+css+' ]; then cp ./src/impress.css ./src/'+css+' ; fi'))
        .pipe(print(function(filepath) {
          return "done pandoc: " + filepath;
        }))
        .pipe(print(function(filepath) {
          return "pdf-start";
        }))
        .pipe(exec('./decktape-1.0.0/phantomjs ./decktape-1.0.0/decktape.js impress ./src/'+title+'.html ./src/'+title+'.pdf'))
        .pipe(print(function(filepath) {
          return "pdf-end, pandoc-end";
        }));
    }));
});

gulp.task('watch', function() {
  gulp.watch(['./src/*.impress.md'],['pandoc']);
  gulp.src('gulpfile.js');
});

gulp.task('default', ['watch', 'webserver','pandoc']);
