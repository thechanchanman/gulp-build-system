/********************************************
** Required
********************************************/
const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const browserSync = require('browser-sync');
const compass = require('gulp-compass');
const del = require('del');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const php = require('gulp-connect-php');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');

const exec = require('child_process').exec;
const spawn = require('child_process').spawn;

/********************************************
** Paths
********************************************/
const dest = 'public';
const source = 'src';
const proxy = '127.0.0.1/beta'; // localhost/[folder] for php

const scripts = {
  // *** probably this section will be removed later ***
  // all scripts except vendor scripts (usually *.min.js files)
  in : [source + '/js/**/*.js', '!' + source + '/js/**/*.min.js'],
  out : dest + '/js',
  vendorsIn : source + '/js/**/*.min.js',
  vendorsOut : dest + '/js',
  webpack : dest + '/js/**/*.js'
};

const styles = {
  main : source + '/scss/styles.scss',
  in : source + '/scss/**/*.scss',
  out : dest + '/css'
};

const htmlPages = {
  in : dest + '/**/*.html'
};

const phpPages = {
  in : '**/*.php'
};

const images = {
  in : source + '/images/*.*',
  out: dest + '/images/'
};

/********************************************
** Script tasks
********************************************/
gulp.task('vendorScripts', function(){
  // only distribute minified js files
  gulp.src(scripts.vendorsIn)
  .pipe(gulp.dest(scripts.out));
});

gulp.task('scripts', ['vendorScripts'], function(){
  gulp.src(scripts.in)
  .pipe(plumber())
  // optional --- initializing sourcemaps
  .pipe(sourcemaps.init())
  // compile ES6 code with Babel
  .pipe(babel())
  // adding .min suffix to file name
  .pipe(rename({suffix:'.min'}))
  // minify
  .pipe(uglify())
  // optional --- writing sourcemaps
  .pipe(sourcemaps.write())
  .pipe(gulp.dest(scripts.out))
  .pipe(browserSync.reload({ stream:true }));
});

/********************************************
** Compass / Sass tasks
********************************************/
gulp.task('compass', function(){
  gulp.src(styles.in)
  .pipe(plumber())
  .pipe(compass({
    config_file: './config.rb',
    css: styles.out,
    sass: source + '/scss',
    sourcemap: true,
    require: ['susy']
  }))
  .pipe(autoprefixer({browsers: ['last 5 versions']}))
  .pipe(gulp.dest(styles.out))
  .pipe(browserSync.reload({ stream:true }));
});

/********************************************
** HTML tasks
********************************************/
gulp.task('html', function(){
  gulp.src(htmlPages.in)
  .pipe(browserSync.reload({ stream:true }));
});

/********************************************
** PHP tasks
********************************************/
gulp.task('php-serve', function() {
  php.server({
    base: dest
  }, function (){
    browserSync({
      proxy: '127.0.0.1' + '/beta/' + dest
    });
  });
});

/********************************************
** Webpack tasks
********************************************/
gulp.task('webpack', function(cb){
  exec('webpack', function(err, stdout, stderr){
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

/********************************************
** Browser-Sync tasks
********************************************/
gulp.task('browser-sync', function(){
  browserSync({
    server: {
      baseDir: dest
    }
  });
});

/********************************************
** Images tasks
********************************************/
gulp.task('images', function(){
  gulp.src(images.in)
  .pipe(newer(images.out))
  .pipe(imagemin())
  .pipe(gulp.dest(images.out));
});

/********************************************
** Watch tasks
********************************************/
gulp.task('watch', function(){
  // watch for changes on js files
  // gulp.watch(scripts.in, ['scripts']);

  // watch for changes in scripts destination
  // folder from webpack
  gulp.watch(scripts.webpack).on('change', browserSync.reload);

  // watch for changes on scss files
  gulp.watch(styles.in, ['compass']);

  // watch for changes on html files
  gulp.watch(htmlPages.in, ['html']);

  // watch for changes on php files
  // gulp.watch(phpPages.in).on('change', browserSync.reload);
});

/********************************************
** Default task
********************************************/
// use browser-sync for serving html pages
// or php for php pages
gulp.task('default', [
  'webpack',
  'compass',
  'html',
  'browser-sync',
  'watch'
]);
