import del from 'del';
import gulp from 'gulp';
// import javascriptObfuscator from "gulp-javascript-obfuscator";
import ts from 'gulp-typescript';
import uglify from 'gulp-uglify';
import zip from 'gulp-zip';

gulp.task('clean', function () {
    return del('dist/**', { force: true });
});

gulp.task('compile', function () {
    const tsProject = ts.createProject('tsconfig.json');
    const tsResult = gulp.src('lib/**/*.ts').pipe(tsProject())

    return tsResult.pipe(uglify()).pipe(gulp.dest('dist/'))
});

gulp.task('copy-assets', function () {
    return gulp.src(['src/assets/**/*'])
        .pipe(gulp.dest('dist/src/assets'));
})

gulp.task('zip', function () {
    return gulp.src('dist/**/*', { dot: true })
        .pipe(zip('be-common.zip'))
        .pipe(gulp.dest('./dist'))
})

gulp.task('build', gulp.series("clean", "compile", gulp.parallel("copy-assets"), "zip"))
