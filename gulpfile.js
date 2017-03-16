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
  //TODO md > pages.ejs
  gulp.src(_path.src+'/*.impress.md')
    .pipe(cached('ejs'))

    .pipe(replace(/^[^#]/gm, '\n+++'))

    //.pipe(replace(/^# (.*)$/gm, '  <h1>$1</h1>'))
    //.pipe(replace(/^## (.*)$/gm, '  <h2>$1</h2>'))
    //.pipe(replace(/^---$/gm, "</div>\n\n<div class='step' >"))
    //.pipe(replace(/^/, "<div class='step' >\n"))

    .pipe(rename('_pages.ejs'))
    .pipe(gulp.dest(_path.src))
    .pipe(gulp.dest(_path.ejs))
    .pipe(print(function(filepath) {
      return "pages: " + filepath;
    }));

  return gulp.src(_path.src+'/*.impress.md')
    .pipe(cached('ejs'))
    .pipe(tap(function(file,t) {
      var filename = path.basename(file.path);
      var title = filename.split(/\.(?=[^.]+$)/)[0];
      title = title.split(/\.(?=[^.]+$)/)[0];
      console.log('title: '+title);
      var css = title+'.css';
      gulp.src(["./ejs/index.html","!./ejs/*.ejs"])
        .pipe(ejs({
          title: title,
          css: css
        }))
        .pipe(rename(title+'.html'))
        .pipe(gulp.dest(_path.src))
        .pipe(print(function(filepath) {
          return "ejs: " + filepath;
        }));
      gulp.src('./')
        .pipe(exec('cp ./src/impress.css ./src/"'+title+'".css'));
    }));
});

gulp.task('watch', function() {
  gulp.watch([_path.src+'/*.impress.md'],['ejs']);
  gulp.src('gulpfile.js');
});

gulp.task('default', ['watch', 'webserver','ejs']);
