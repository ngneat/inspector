const gulp = require("gulp");
const clean = require("gulp-clean");
const uglify = require("gulp-uglify");
const browserify = require("browserify");
const source = require("vinyl-source-stream");
const tsify = require("tsify");
const eventStream = require("event-stream");
const rename = require("gulp-rename");
const buffer = require("vinyl-buffer");
const sourcemaps = require("gulp-sourcemaps");
const postcss = require("gulp-postcss");
const uncss = require("postcss-uncss");
const purgecss = require("gulp-purgecss");

const paths = {
  pages: ["src/**/*.html"],
  dist: "dist",
  assets: ["src/manifest.json", "src/static/**/*.*"],
  files: [
    "src/background.ts",
    "src/content-script.ts",
    "src/in-app.ts",
    "src/ng-check.ts",
    "src/constants.ts",
  ],
  popup: ["src/popup/popup.ts"],
  css: ["src/**/*.css"],
};

gulp.task("clean-dist", () => {
  return gulp.src(paths.dist, { read: false, allowEmpty: true }).pipe(clean());
});

gulp.task("copy-assets", () => {
  return gulp.src(paths.assets).pipe(gulp.dest(paths.dist));
});

gulp.task("copy-pages", () => {
  return gulp.src(paths.pages).pipe(gulp.dest(paths.dist));
});

gulp.task("css", () => {
  return gulp
    .src(paths.css[0])
    .pipe(
      purgecss({
        content: [paths.pages[0]],
      })
    )
    .pipe(gulp.dest(paths.dist));
});

gulp.task("ts", async () => {
  const tasks = (path = paths.files, dirname = ".") =>
    path.map((entry) => {
      return browserify({
        basedir: ".",
        debug: true,
        entries: [entry],
        cache: {},
        packageCache: {},
      })
        .plugin(tsify)
        .bundle()
        .pipe(source(entry))
        .pipe(
          rename({
            dirname: dirname,
            extname: ".js",
          })
        )
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify())
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest("dist"));
    });
  return eventStream.merge.apply(null, tasks(), tasks(paths.popup, "popup"));
});

gulp.task(
  "build",
  gulp.series(
    "clean-dist",
    gulp.parallel("copy-assets", "copy-pages", "ts", "css")
  )
);

gulp.task("watch", function () {
  gulp.watch("src/**/*.*", gulp.series("build"));
});

gulp.task("default", gulp.series("build", "watch"));
