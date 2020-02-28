'use strict';
// - - - - - - - - - - - - - - - Create the vars
var gulp = require('gulp'),
	pug = require('gulp-pug'),
	changed = require('gulp-changed'),
	plumber = require('gulp-plumber'),
	sass  = require('gulp-sass'),
	browserSync = require('browser-sync').create(),
	clean = require('gulp-clean'),
	//Directory vars
	watch = {
		html:"./src/**/*.pug",
		css:"./src/styles/*.scss",
	},
	sourceHtmlFiles = Array(
		'./src/*.pug',
		'!./src/partials/_*.pug',
	),
	sourceCssFiles = Array(
		'./src/styles/*.scss'
	);
// Add the sass compiler
sass.compiler = require('node-sass');
// BrowserSync Reload
function browserSyncReload() {
	browserSync.reload();
}
// - - - - - - - - - - - - - - - TASKS
// Clean the build directory
gulp.task('clean', function () {
	return gulp.src('./build', { read: false })
		.pipe(plumber())
		.pipe(clean());
});
// The HTML folder
gulp.task('html', function(){
	return gulp.src(sourceHtmlFiles)
	  .pipe(plumber())
	  .pipe(pug({pretty: true}))
	  .pipe(gulp.dest('./build'));
  });
  // The Sass generate CSS files
  gulp.task('css', function(done){
	return gulp.src(sourceCssFiles)
	  .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
	  .pipe(plumber())
	  .pipe(changed('./build/styles'))
	  .pipe(gulp.dest('./build/styles'))
	  .pipe(browserSync.stream({ match: "**/*.css" }))
});
/** main function defatult
*/
gulp.task("default",  gulp.parallel("html", "css",
  function() {
	// Start Browser Sync
	browserSync.init({
	  server: {
		baseDir: "./build"
	}
	});
	// Check for source changes
	gulp.watch(watch.css, gulp.series("css"));
	gulp.watch(watch.html, gulp.parallel("html")).on('change', browserSyncReload);
  }
));