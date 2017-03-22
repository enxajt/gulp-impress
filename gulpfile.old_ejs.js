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
var replace = require('gulp-replace');

var _path = {
  src : './src',
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
    //.pipe(cached('ejs'))
    .pipe(tap(function(file,t) {
      var filename = path.basename(file.path);
      var title = filename.split(/\.(?=[^.]+$)/)[0];
      title = title.split(/\.(?=[^.]+$)/)[0];
      console.log('title: '+title);
      var css = title+'.css';
      gulp.src(["./ejs/index.html","!./ejs/*.ejs"])
        .pipe(exec('echo test > ./ttss'))
        .pipe(ejs({
          title: title,
          pages: title,
          css: css
        }))
        .pipe(rename(title+'.html'))
        .pipe(gulp.dest(_path.src))
        .pipe(print(function(filepath) {
          return "ejs: " + filepath;
        }))
        //.pipe(cached('ejs'))
        .pipe(print(function(filepath) {
          return "pdf-start";
        }))
        .pipe(print(function(filepath) {
          return "pdf-end";
        }))
        .pipe(print(function(filepath) {
          return "ejs-end";
        }));
    }));
});

gulp.task('watch', function() {
  gulp.watch([_path.src+'/*.impress.md'],['ejs']);
  gulp.src('gulpfile.js');
});

gulp.task('default', ['watch', 'webserver','ejs']);
