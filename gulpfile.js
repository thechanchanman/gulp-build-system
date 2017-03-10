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
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');

/********************************************
** Paths
********************************************/
const dest = 'public';
const source = 'src';

const scripts = {
  // *** probably this section will be removed later ***
  // all scripts except vendor scripts (usually *.min.js files)
  in : [source + '/js/**/*.js', '!' + source + '/js/**/*.min.js'],
  out : dest + '/js',
  vendorsIn : source + '/js/**/*.min.js',
  vendorsOut : dest + '/js'
};

const styles = {
  main : source + '/scss/styles.scss',
  in : source + '/scss/**/*.scss',
  out : dest + '/css'
};

const pages = {
  in : dest + '/**/*.html'
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
  gulp.src(pages.in)
  .pipe(browserSync.reload({ stream:true }));
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
  // watch for changes on js files inside
  // src/js folder and run 'scripts' task
  gulp.watch(scripts.in, ['scripts']);
  // watch for changes on scss files inside
  // src/scss folder and run 'compass' task
  gulp.watch(styles.in, ['compass']);
  // watch for changes on html files inside
  // dist folder and run 'html' task
  gulp.watch(pages.in, ['html']);
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
