const gulp         = require('gulp');
const $ = require('gulp-load-plugins')();
const yaml = require('js-yaml');
const fs = require('fs');

// Task describe
const errorMsg = 'Error <%= error.message %>';
const path = yaml.safeLoad(fs.readFileSync('gulp.yml','utf8'));

gulp.task('api:concat', () => {
  return gulp.src(path.api.src)
    .pipe($.concat(`${path.api.cnct_name}.md`))
    .pipe($.plumber({
      errorHandler: $.notify.onError(errorMsg),
    }))
    .pipe(gulp.dest(path.api.dst));
});

gulp.task('api:compile', ['api:concat'], () => {
  return gulp.src(`${path.api.dst}/${path.api.cnct_name}.md`)
    .pipe($.plumber({
      errorHandler: $.notify.onError(errorMsg),
    }))
    .pipe($.aglio({ template: 'default' }))
    .pipe(gulp.dest(path.api.dst))
    .pipe($.livereload());
});

gulp.task('api:runserver', () => {
  gulp.src(path.api.dst)
    .pipe($.plumber({
      errorHandler: $.notify.onError(errorMsg),
    }))
  .pipe($.webserver({
    liveread: true,
    port    : path.api.doc_port,
  }));
});

gulp.task('api:livecoding', () => {
  gulp.src(path.api.src)
    .pipe($.watch(path.api.src))
    .pipe($.plumber({ errorHandler: $.notify.onError(errorMsg) }))
    .pipe($.aglio({ template: 'default' }))
    .pipe(gulp.dest(path.api.dst));
});

gulp.task('api:mock', ['api:compile'], $.shell.task([
  `api-mock ${path.api.dst}/${path.api.cnct_name}.html --port ${path.api.mock_port}`,
]));

// watch setting
gulp.task('watch', () => {
  gulp.watch([path.api.src], () => {
    $.watch([path.api.src], ()  => {
      gulp.start('api:concat');
      gulp.start('api:compile');
    });
  });
});

// Run
gulp.task(
    'default',
    ['watch','api:runserver',
    'api:concat',
    'api:compile','api:runserver', 'api:mock']
    );
