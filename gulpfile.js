const gulp = require("gulp");
const sass = require("gulp-sass");
const cssmin = require("gulp-cssmin");
const browserSync = require("browser-sync").create();
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const del = require("del");
const fileinclude = require("gulp-file-include");

function img() {
  return gulp
    .src("./src/images/**/**.*")
    .pipe(gulp.dest("./www/images/"))
    .pipe(browserSync.stream());
}

function styles() {
  return gulp
    .src("./src/scss/**/*.scss")
    .pipe(
      plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
    )
    .pipe(sass().on("error", sass.logError))
    .pipe(cssmin())
    .pipe(gulp.dest("./www/css/"))
    .pipe(browserSync.stream());
}

function clean(done) {
  del.sync(["www/**"]);
  done();
}

function html() {
  return gulp
    .src("./src/*.html")
    .pipe(
      plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
    )
    .pipe(
      fileinclude({
        prefix: "@@",
        basepath: "@file",
      })
    )
    .pipe(gulp.dest("./www/"))
    .pipe(browserSync.stream());
}

function watch() {
  browserSync.init({
    server: {
      baseDir: "./www/",
    },
  });
  gulp.watch("./src/scss/**/*.scss", styles);
  gulp.watch("./src/images/**/*", gulp.series(clean, img, html, styles));
  gulp
    .watch("src/**/*.html", gulp.series(html))
    .on("change", browserSync.reload);
}

gulp.task("styles", styles);
gulp.task("del", clean);
gulp.task("watch", watch);
gulp.task("build", gulp.series(clean, gulp.parallel(styles, html, img)));
gulp.task("dev", gulp.series("build", "watch"));
