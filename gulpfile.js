var gulp = require('gulp');
var path = require('path');
var webserver = require('gulp-webserver');
var print = require('gulp-print');
var tap = require('gulp-tap');
var exec = require('gulp-exec');
var ejs = require('gulp-ejs');
var rename = require('gulp-rename');
var cached = require('gulp-cached');
var plumber = require('gulp-plumber');
var fs = require('fs');

var _path = {
  src : './src',
  dst : './dst',
  ejs : './ejs'
};

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

gulp.task('ejs', function() {
  return gulp.src(_path.src+'/*.impress.md')
    .pipe(cached('ejs'))
    .pipe(tap(function(file,t) {
      console.log('start ejs');
      var filename = path.basename(file.path);
      var title = filename.split(/\.(?=[^.]+$)/)[1];
      var css = title+'.css';
      console.log('before ejs: '+title);
      gulp.src(["./ejs/index.html","!./ejs/*.ejs"])
        .pipe(ejs({
          title: title,
          css: css
        }))
        .pipe(rename(title+'.html'))
        .pipe(gulp.dest(_path.dst))
        .pipe(print(function(filepath) {
          return "ejs: " + filepath;
        }));
    }));
});

gulp.task('watch', function() {
  gulp.watch([_path.src+'/*.impress.md'],['ejs']);
  gulp.src('gulpfile.js');
});

gulp.task('default', ['watch', 'webserver','ejs']);
