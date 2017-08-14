var gulp = require('gulp');
var minifycss = require('gulp-minify-css');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');


gulp.task('build:css',function(){
	gulp.src('./public/css/*.css')			
		.pipe(minifycss())		
		.pipe(gulp.dest('src/css'));
});

 

gulp.task('build:js', function () {
    gulp.src('./public/js/index.js')
        .pipe(uglify())
        .pipe(gulp.dest('src/js'));
});