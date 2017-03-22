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
var fs = require("fs");

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
      var sed = fs.readFileSync("./src/impress/replace.sh", "utf8");
      gulp.src(["./ejs/index.html","!./ejs/*.ejs"])
        .pipe(exec('cat '+file.path+' > '+sed+' > ./src/'+title+'_pages.ejs'))
        .pipe(exec('[ -e ./src/'+css+' ] || cp ./src/impress/template.css ./src/'+css))
        .pipe(exec('rm -f ./src/impress/'+title+'.html'))
        .pipe(fs.readFileSync('./src/impress/'+title+'.html', "utf-8", function(err, _data) {
          console.log('test_sed: ');
          var pages = _data;
          console.log('pages: '+pages);
        }))
        .pipe(ejs({
          title: title,
          css: css,
          pages: pages
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
        .pipe(exec('./decktape-1.0.0/phantomjs ./decktape-1.0.0/decktape.js impress ./src/'+title+'.html ./src/'+title+'.pdf'))
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
