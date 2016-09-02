var gulp = require('gulp');
var src = './src';
var dest = './dist';

var jade = require('gulp-jade');
gulp.task('templates', function() {
	var YOUR_LOCALS = {};

	gulp.src(src + '/**/*.jade')
	.pipe(jade({
		locals: YOUR_LOCALS
	}))
	.pipe(gulp.dest(dest))
});

var gls = require('gulp-live-server');
gulp.task('serve', function() {
	//1. serve with default settings 
	var server = gls.static(dest); //equals to gls.static('public', 3000); 
	server.start();

	//use gulp.watch to trigger server actions(notify, start or stop) 
	gulp.watch([src + '/includes/*.jade', src + '/*.jade'], ['templates', 'bootlint']);
	gulp.watch([src + '/*.js'], ['scripts']);
	gulp.watch([src + '/*.scss'], ['styles']);
	gulp.watch([dest + '/*.html', dest + '/js/*.js', dest + '/css/*.css'], function (file) {
		server.notify.apply(server, [file]);
	});
});

var concat = require('gulp-concat');
var minify = require('gulp-minify');
gulp.task('scripts', function() {
	return gulp.src(['./node_modules/angular/angular.js', src + '/*.js'])
	.pipe(concat('scripts.js'))
	// .pipe(minify({
	// 	ext:{
	// 		src:'-debug.js',
	// 		min:'.js'
	// 	},
	// 	exclude: ['tasks'],
	// 	ignoreFiles: ['.combo.js', '-min.js']
	// }))
	.pipe(gulp.dest(dest + '/js'));
});

// Stolen from http://www.codevoila.com/post/32/customize-bootstrap-using-bootstrap-sass-and-gulp 
var bootstrapSass = {
	in: './node_modules/bootstrap-sass/'
};
var fonts = {
	in: bootstrapSass.in + 'assets/fonts/**/*',
	out: dest + '/fonts/'
};
gulp.task('fonts', function () {
	return gulp
	.src(fonts.in)
	.pipe(gulp.dest(fonts.out));
});

gulp.task('data', function () {
	return gulp
	.src(src + '/data.json')
	.pipe(gulp.dest(dest + '/data/'));
});

var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
gulp.task('styles', ['fonts'], function(){
	return gulp.src(src + '/styles.scss')
	.pipe(sass({
		includePaths: ['./node_modules/bootstrap-sass/assets/stylesheets/'],
		outputStyle: 'compressed',
	}).on('error', sass.logError))
	.pipe(autoprefixer({
		browsers: ['last 3 versions'],
		cascade: false
	}))
	.pipe(gulp.dest(dest + '/css/'))
});

var bootlint  = require('gulp-bootlint');
gulp.task('bootlint', function() {
	return gulp.src(dest + '/*.html')
	.pipe(bootlint());
});

var imagemin = require('gulp-imagemin');
gulp.task('imagemin', function() {
	return gulp.src(src + '/images/**/*')
	.pipe(imagemin())
	.pipe(gulp.dest(dest + '/images'));
});

gulp.task('default', ['scripts', 'styles', 'templates', 'serve']);