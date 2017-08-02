//
// Import package
//

const gulp = require('gulp');
const del = require('del');

//
// Command Tasks
//

gulp.task('delFiles', function(cb) {
    del('./Build/Cesium').then(paths => {
        console.log('Deleted files and folders:\n', paths.join('\n'));
        cb();
    });
})

gulp.task('copyFiles', ['delFiles'], function() {
    gulp.src('./Thirdparty/Cesium/Build/Cesium/**')
        .pipe(gulp.dest('./Build/Cesium'));
});

//
// Default Task
//

gulp.task('default', ['copyFiles','delFiles']);