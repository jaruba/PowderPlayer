var gulp = require('gulp');
var util = require('gulp-util');

var clean = require('gulp-clean');
var header = require('gulp-header');
var less = require('gulp-less');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');

var pkg = require('./package.json');
var currentYear = util.date(new Date(), 'yyyy');

var paths = {
    scripts: [
        './bootstrap-progressbar.js'
    ],
    styles: [
        './resources/bootstrap-progressbar-2.0.0.less',
        './resources/bootstrap-progressbar-2.0.1.less',
        './resources/bootstrap-progressbar-2.0.2.less',
        './resources/bootstrap-progressbar-2.0.3.less',
        './resources/bootstrap-progressbar-2.0.4.less',
        './resources/bootstrap-progressbar-2.1.0.less',
        './resources/bootstrap-progressbar-2.1.1.less',
        './resources/bootstrap-progressbar-2.2.0.less',
        './resources/bootstrap-progressbar-2.2.1.less',
        './resources/bootstrap-progressbar-2.2.2.less',
        './resources/bootstrap-progressbar-2.3.0.less',
        './resources/bootstrap-progressbar-2.3.1.less',
        './resources/bootstrap-progressbar-2.3.2.less',
        './resources/bootstrap-progressbar-3.0.0-rc1.less',
        './resources/bootstrap-progressbar-3.0.0-rc2.less',
        './resources/bootstrap-progressbar-3.0.0.less',
        './resources/bootstrap-progressbar-3.0.1.less',
        './resources/bootstrap-progressbar-3.0.2.less',
        './resources/bootstrap-progressbar-3.0.3.less',
        './resources/bootstrap-progressbar-3.1.0.less',
        './resources/bootstrap-progressbar-3.1.1.less',
        './resources/bootstrap-progressbar-3.2.0.less',
        './resources/bootstrap-progressbar-3.3.0.less',
    ]
};

var banner = '/*! <%= pkg.name %> v<%= pkg.version %> | Copyright (c) 2012-<%= currentYear %> <%= pkg.author %> | <%= pkg.license %> license | <%= pkg.homepage %> */\n';

gulp.task('scripts', function() {
    return gulp.src(paths.scripts)
        .pipe(uglify())
        .pipe(header(banner, {pkg: pkg, currentYear: currentYear}))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('.'));
});

gulp.task('styles', function() {
    return gulp.src(paths.styles)
        .pipe(less())
        .pipe(header(banner, {pkg: pkg, currentYear: currentYear}))
        .pipe(gulp.dest('./css'));
});

gulp.task('styles-min', function() {
    return gulp.src(paths.styles)
        .pipe(less())
        .pipe(minifyCss())
        .pipe(header(banner, {pkg: pkg, currentYear: currentYear}))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./css'));
});

gulp.task('clean', function() {
    return gulp.src('./css', {read: false})
        .pipe(clean());
});

gulp.task('default', ['clean', 'scripts', 'styles', 'styles-min']);
