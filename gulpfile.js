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
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');

/********************************************
** Paths
********************************************/
const folders = {
  // public base directory
  publicBase : './dist',
  // public CSS directory
  publicCss : 'dist/css',
  // public JS directory
  publicJs : 'dist/js',
  // JS development directory
  devJs : 'src/js',
  // Sass development directory
  devSass : 'src/scss'
};

const files = {
  // all script files excluding vendor scripts
  scripts : ['src/js/**/*.js', '!src/js/**/*.min.js'],
  // all vendor scripts
  vendorScripts : 'src/js/**/*.min.js',
  // all script files including vendor script
  allScripts : 'src/js/**/*.js',
  // main stylesheet
  style : 'src/scss/styles.scss',
  // all stylesheets
  allStyles : 'src/scss/**/*.scss',
  // all html files
  html : 'dist/**/*.html'
};

/********************************************
** Script tasks
********************************************/
gulp.task('scripts', function(){
  gulp.src(files.scripts)
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
  .pipe(gulp.dest(folders.publicJs));
  // only distribute minified js files
  gulp.src(files.vendorScripts)
  .pipe(gulp.dest(folders.publicJs))
  .pipe(browserSync.reload({ stream:true }));
});

/********************************************
** Compass / Sass tasks
********************************************/
gulp.task('compass', function(){
  gulp.src(files.allStyles)
  .pipe(plumber())
  .pipe(compass({
    config_file: './config.rb',
    css: folders.publicCss,
    sass: folders.devSass,
    sourcemap: true,
    require: ['susy']
  }))
  .pipe(autoprefixer({browsers: ['last 5 versions']}))
  .pipe(gulp.dest(folders.publicCss))
  .pipe(browserSync.reload({ stream:true }));
});

/********************************************
** HTML tasks
********************************************/
gulp.task('html', function(){
  gulp.src(files.html)
  .pipe(browserSync.reload({ stream:true }));
});

/********************************************
** Browser-Sync tasks
********************************************/
gulp.task('browser-sync', function(){
  browserSync({
    server: {
      baseDir: folders.publicBase
    }
  });
});

/********************************************
** Watch tasks
********************************************/
gulp.task('watch', function(){
  // watch for changes on js files inside
  // src/js folder and run 'scripts' task
  gulp.watch(files.allScripts, ['scripts']);
  // watch for changes on scss files inside
  // src/scss folder and run 'compass' task
  gulp.watch(files.allStyles, ['compass']);
  // watch for changes on html files inside
  // dist folder and run 'html' task
  gulp.watch(files.html, ['html']);
});

/********************************************
** Default task
********************************************/
gulp.task('default', [
  'scripts',
  'compass',
  'html',
  'browser-sync',
  'watch'
]);
