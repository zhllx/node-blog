var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var browserSync = require('browser-sync').create();

// Static server
// gulp.task('browser-sync', function(){
//     var files = [
//     '**/*.html',
//     '**/*.css',
//     '**/*.js'
//     ];
//     browserSync.init(files,{
//         server: {
//             baseDir: "./"
//         }
//     });
// });
gulp.task('browser-sync', function() {
    browserSync.init(null, {
        proxy: 'http://localhost:3000',
        files: ['public/**/*.*', 'views/**/*.*','routes/*'],
        browser: 'google chrome',
        notify: false,
        port:3002
    });
});
gulp.task('default', ['browser-sync']); //定义默认任务
