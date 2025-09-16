import gulp from 'gulp';
import pug from 'gulp-pug';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass(dartSass);
import plumber from 'gulp-plumber';
import autoprefixer from 'gulp-autoprefixer';
import browserSync from 'browser-sync';
import cleanCSS from 'gulp-clean-css';
import uglify from 'gulp-uglify';
import rename from 'gulp-rename';
import gcmq from 'gulp-group-css-media-queries';
import imagemin, { gifsicle, mozjpeg, optipng, svgo } from 'gulp-imagemin';
import webp from 'gulp-webp';
import svgSprite from 'gulp-svg-sprite';
import ttf2woff2 from 'gulp-ttftowoff2';
import ttf2woff from 'gulp-ttf2woff';

// * Команды *
// "gulp" - запуск gulp.
// "gulp mg" - группировка всех медиазапросов в конец файла main.css.
// "gulp min" - сжимает js, css (создает минимизированные файлы script.min.js и main.min.css).
// "gulp img-min" - сжимает изображения
// "gulp webp" - конвертирует изображения jpeg, jpg, png в формат webp
// "gulp svgsprite" - собирает все svg из папки svg_icons в один svg спрайт
// "gulp fonts" - конвертирует ttf шрифты в woff и woff2

// * Настройки *
const html = false; // Нужно ли делать перезагрузку браузера при изменении html файлов (если не используется pug)
const server = false; // Если используется OpenServer и php
const proxy = 'http://test/'; // Адрес для liveserver

// * Пути к папкам относительно корня проекта *
const scssPath = 'scss', // Scss
  cssPath = 'css', // Css
  pugPath = 'pug', // Pug
  htmlPath = './', // Html
  jsPath = 'js', // Js
  imgPath = 'img'; // Изображения

gulp.task('pugBuild', function () {
  return gulp.src(pugPath + '/*.pug')
    .pipe(plumber())
    .pipe(pug({
      pretty: '\t'
    }))
    .pipe(gulp.dest(htmlPath))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('styleBuild', function () {
  return gulp.src(scssPath + '/*.scss')
    .pipe(plumber())
    .pipe(sass({ outputStyle: 'expanded', quietDeps: true, silenceDeprecations: ['import'] }).on('error', sass.logError))
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(gulp.dest(cssPath))
    .pipe(browserSync.reload({ stream: true }));
});

if (!server) {
  gulp.task('browser-sync', function () {
    browserSync.init({
      server: {
        baseDir: htmlPath,
      },
      notify: true,
    });
  });
} else {
  gulp.task('browser-sync', function () {
    browserSync.init({
      proxy: proxy,
    });
  });
}

gulp.task('css-min', function () {
  return gulp.src(cssPath + '/main.css')
    .pipe(cleanCSS({
      level: 2
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(cssPath));
});

gulp.task('js-min', function () {
  return gulp.src(jsPath + '/scripts.js')
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(jsPath));
});

gulp.task('img-min', function () {
  return gulp.src([imgPath + '/**/*', '!' + imgPath + '/svg_icons/*'])
    .pipe(imagemin([
      gifsicle({ interlaced: true }),
      mozjpeg({ quality: 75, progressive: true }),
      optipng({ optimizationLevel: 5 }),
      svgo({
        plugins: [
          {
            name: 'removeViewBox',
            active: true
          },
          {
            name: 'cleanupIDs',
            active: false
          }
        ]
      })
    ]))
    .pipe(gulp.dest(imgPath));
});

gulp.task('mg', function () {
  return gulp.src(cssPath + '/main.css')
    .pipe(gcmq())
    .pipe(gulp.dest(cssPath));
});

gulp.task('svgsprite', function () {
  return gulp.src(imgPath + '/svg_icons/*.svg')
    .pipe(svgSprite({
      shape: {
        dimension: {
          maxWidth: 500,
          maxHeight: 500
        },
        spacing: {
          padding: 0
        },
        transform: [{
          svgo: {
            plugins: [
              {
                name: "removeAttrs",
                params: {
                  attrs: "(fill|stroke|style)"
                }
              },
              {
                name: 'preset-default',
                params: {
                  removeViewBox: false,
                  removeUnusedNS: false,
                  removeUselessStrokeAndFill: true,
                  cleanupIDs: false,
                  removeComments: true,
                  removeEmptyAttrs: true,
                  removeEmptyText: true,
                  collapseGroups: true,
                }
              }
            ]
          }
        }]
      },
      mode: {
        symbol: {
          dest: '.',
          sprite: 'sprite.svg'
        }
      }
    })).on('error', function (error) { console.log(error); })
    .pipe(gulp.dest(imgPath));
});

gulp.task('watch', function () {
  gulp.watch(pugPath + '/**/*.pug', gulp.parallel('pugBuild'));
  if (html) {
    gulp.watch(htmlPath + '**/*.html', function reload(done) {
      browserSync.reload();
      done();
    });
  }
  gulp.watch(jsPath + '/**/*.js', function reload(done) {
    browserSync.reload();
    done();
  });
  gulp.watch('**/*.php', function reload(done) {
    browserSync.reload();
    done();
  });
  gulp.watch(scssPath + '/**/*.scss', gulp.parallel('styleBuild'));
  gulp.watch(imgPath + '/svg_icons/*.svg', gulp.parallel('svgsprite'));
});

gulp.task('webp', () =>
  gulp.src(imgPath + '/**/*.+(jpg|png|jpeg)')
    .pipe(webp())
    .pipe(gulp.dest(imgPath))
);

gulp.task('ttf2woff2', function () {
  return gulp.src(['fonts/**/*.ttf'], {
      encoding: false, // Important!
      removeBOM: false,
    })
    .pipe(ttf2woff2())
    .pipe(gulp.dest('fonts'));
});

gulp.task('ttf2woff', function () {
  return gulp.src(['fonts/**/*.ttf'], {
    encoding: false, // Important!
    removeBOM: false,
  })
    .pipe(ttf2woff())
    .pipe(gulp.dest('fonts'));
});


gulp.task('fonts', gulp.parallel('ttf2woff', 'ttf2woff2'));

gulp.task('default', gulp.parallel('browser-sync', 'pugBuild', 'styleBuild', 'svgsprite', 'watch'));

gulp.task('min', gulp.parallel('css-min', 'js-min'));