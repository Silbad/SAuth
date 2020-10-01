const gulp = require('gulp');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');

const paths = {
    scss: {
        src_popup: [
            "./assets/scss/popup.scss"
        ],
        src_options: [
            "./assets/scss/options.scss"
        ],
        watch: "./assets/scss/**/*.scss",
        dest: "./app/"
    },
    js: {
        src_popup: [
            "./node_modules/jquery/dist/jquery.min.js",
            ".node_modules/qrcode-generator/qrcode.js",
            "./node_modules/otplib/otplib-browser.js",
            "./node_modules/jquery-circle-progress/dist/circle-progress.min.js",
            "./node_modules/popper.js/dist/umd/popper.min.js",
            "./node_modules/bootstrap/dist/js/bootstrap.min.js",
            "./assets/js/popup.js"
        ],
        src_options: [
            "./node_modules/jquery/dist/jquery.min.js",
            ".node_modules/qrcode-generator/qrcode.js",
            "./node_modules/otplib/otplib-browser.js",
            "./node_modules/jquery-circle-progress/dist/circle-progress.min.js",
            "./node_modules/popper.js/dist/umd/popper.min.js",
            "./node_modules/bootstrap/dist/js/bootstrap.min.js",
            "./assets/js/options.js"
        ],
        dest: "./app/"
    }
};

// gulp.task('sync-fa', (done) => {
//     syncy(['node_modules/font-awesome/fonts/**'], 'fonts/', {
//         verbose: true,
//         base: 'node_modules/font-awesome/fonts/'
//     })
//     .then(() => {
//         done();
//     })
//     .catch((err) => {
//         done(err);
//     });
// });

function style_popup() {
    return (
        gulp
            .src(paths.scss.src_popup)
            .pipe(sass())
            .on("error", sass.logError)
            .pipe(concat('popup-min.css'))
            .pipe(cleanCSS())
            .pipe(gulp.dest(paths.scss.dest))
    );
}

function style_options() {
    return (
        gulp
            .src(paths.scss.src_options)
            .pipe(sass())
            .on("error", sass.logError)
            .pipe(concat('options-min.css'))
            .pipe(cleanCSS())
            .pipe(gulp.dest(paths.scss.dest))
    );
}

function bundle_popup() {
    return (
        gulp
            .src(paths.js.src_popup)
            .pipe(gulp.dest(paths.js.dest))
    )
}

function bundle_options() {
    return (
        gulp
            .src(paths.js.src_options)
            .pipe(gulp.dest(paths.js.dest))
    )
}

function watch() {
    style_popup();
    style_options();
    bundle_popup();
    bundle_options();
    gulp.watch(paths.scss.watch, style_popup);
    gulp.watch(paths.scss.watch, style_options);
}

exports.watch = watch;