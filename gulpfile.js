'use strict';
// - - - - - - - - - - - - - - - Create the vars
var gulp = require('gulp'),
	pug = require('gulp-pug'),
	changed = require('gulp-changed'),
	plumber = require('gulp-plumber'),
	prettyHtml = require('gulp-pretty-html'),
	exec = require('gulp-exec'),
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
	validateFiles = Array(
		'./build/**/*.html',
		'./build/**/*.css',
		'!./build/images/*',
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
// Move the build to the repo
// Move Assets to build
gulp.task('movebuild', function () {
	var dest = '../AirBnB_clone/web_static', nSrc=0, nDes=0;
	return gulp.src('./build/**/*')
	  .on("data", function() { nSrc+=1;})
	  .pipe(plumber())
	  .pipe(changed(dest))
	  .pipe(gulp.dest(dest))
  
	  .on("data", function() { nDes+=1;})
	  .on("finish", function() {
		  console.log("Results for ../AirBnB_clone/web_static");
		  console.log("# src files: ", nSrc);
		  console.log("# dest files:", nDes);
	  });
});
// The HTML folder
gulp.task('html', function(){
	return gulp.src(sourceHtmlFiles)
	  .pipe(plumber())
	  .pipe(pug({doctype: 'html'}))
	  .pipe(prettyHtml({
		indent_size: 4,
		indent_char: ' '}))
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
gulp.task('w3c', function() {
	var options = {
	  continueOnError: true, // default = false, true means don't emit error event
	  pipeStdout: false, // default = false, true means stdout is written to file.contents
	};
	var reportOptions = {
		err: true, // default = true, false means don't write err
		stderr: false, // default = true, false means don't write stderr
		stdout: true // default = true, false means don't write stdout
	};
	return gulp.src(validateFiles)
	  .pipe(exec('python3 w3c_validator.py <%= file.path %>', options))
	  .pipe(exec.reporter(reportOptions));
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
	gulp.watch(watch.html, gulp.parallel("html","movebuild")).on('change', browserSyncReload);
  }
));