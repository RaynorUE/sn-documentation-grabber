const gulp = require("gulp");
const browserify = require('browserify');
const source = require("vinyl-source-stream");
const tsify = require('tsify');
const minify = require('gulp-minify');
const buffer = require('gulp-buffer');

const paths = {
  pages: ["src/*.html"]
}

gulp.task("default", gulp.series(function () {
  return browserify({
    basedir: ".",
    debug: false,
    entries: ["src/main.ts"],
    cache: {},
    packageCache:{},
  })
  .plugin(tsify)
  .bundle()
  .pipe(source("bundle.js"))
  //.pipe(buffer())
  //.pipe(minify())
  .pipe(gulp.dest("dist"))
}));