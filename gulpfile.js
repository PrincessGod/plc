//
// Import package
//
const fs = require('fs');
const os = require('os');
const path = require('path');
const child_process = require('child_process');

const gulp = require('gulp');
const del = require('del');
const requirejs = require('requirejs');
const Promise = require('bluebird');
const globby = require('globby');
const gulpInsert = require('gulp-insert');
const rimraf = require('rimraf');

//travis reports 32 cores but only has 3GB of memory, which causes the VM to run out.  Limit to 8 cores instead.
const concurrency = Math.min(os.cpus().length, 8);

//
// Command Tasks
//
gulp.task('delFiles', function(cb) {
    del(path.join('Build', 'Cesium')).then(paths => {
        console.log('Deleted files and folders:\n', paths.join('\n'));
        cb();
    });
})

gulp.task('copyFiles', ['delFiles'], function() {
    gulp.src('./Thirdparty/Cesium/Build/Cesium/**')
        .pipe(gulp.dest(path.join('Build', 'Cesium')));
});

gulp.task('requirejs', function(cb) {
    var config = JSON.parse(new Buffer(process.argv[3].substring(2), 'base64').toString('utf8'));
    requirejs.optimize(config, function() {
        cb();
    }, cb);
});

gulp.task('combine', function() {
    var outputDirectory = path.join('Build', 'CesiumUnminified');
    return combineJavaScript({
        removePragmas : false,
        optimizer : 'none',
        outputDirectory : outputDirectory
    });
});
//
// Default Task
//
gulp.task('default', ['copyFiles','delFiles']);

//
// Util Functions
//
function requirejsOptimize(name, config) {
    console.log('Building ' + name);
    return new Promise(function(resolve, reject) {
        var cmd = 'npm run requirejs -- --' + new Buffer(JSON.stringify(config)).toString('base64') + ' --silent';
        child_process.exec(cmd, function(e) {
            if (e) {
                console.log('Error ' + name);
                reject(e);
                return;
            }
            console.log('Finished ' + name);
            resolve();
        });
    });
}

function combineJavaScript(options) {
    var optimizer = options.optimizer;
    var outputDirectory = options.outputDirectory;
    var removePragmas = options.removePragmas;

    var combineOutput = path.join('Build', 'combineOutput', optimizer);
    var copyrightHeader = fs.readFileSync(path.join('Source', 'copyrightHeader.js'));

    var promise = Promise.join(
        combinePlc(!removePragmas, optimizer, combineOutput),
        combineWorkers(!removePragmas, optimizer, combineOutput)
    );

    return promise.then(function() {
        var promises = [];

        //copy to build folder with copyright header added at the top
        var stream = gulp.src([combineOutput + '/**'])
            .pipe(gulpInsert.prepend(copyrightHeader))
            .pipe(gulp.dest(outputDirectory));

        promises.push(streamToPromise(stream));

        var everythingElse = ['Source/**', '!**/*.js', '!**/*.glsl'];

        if (optimizer === 'uglify2') {
            promises.push(minifyCSS(outputDirectory));
            everythingElse.push('!**/*.css');
        }

        stream = gulp.src(everythingElse, {nodir : true}).pipe(gulp.dest(outputDirectory));
        promises.push(streamToPromise(stream));

        return Promise.all(promises).then(function() {
            rimraf.sync(combineOutput);
        });
    });
}

function combinePlc(debug, optimizer, combineOutput) {
    return requirejsOptimize('Cesium.js', {
        wrap : true,
        useStrict : true,
        optimize : optimizer,
        optimizeCss : 'standard',
        pragmas : {
            debug : debug
        },
        baseUrl : 'Source',
        skipModuleInsertion : true,
        name : removeExtension(path.relative('Source', require.resolve('almond'))),
        include : 'main',
        out : path.join(combineOutput, 'Cesium.js')
    });
}

function filePathToModuleId(moduleId) {
    return moduleId.substring(0, moduleId.lastIndexOf('.')).replace(/\\/g, '/');
}

function removeExtension(p) {
    return p.slice(0, -path.extname(p).length);
}

function combineWorkers(debug, optimizer, combineOutput) {
    //This is done waterfall style for concurrency reasons.
    return globby(['Source/Workers/cesiumWorkerBootstrapper.js',
                   'Source/Workers/transferTypedArrayTest.js',
                   'Source/ThirdParty/Workers/*.js'])
        .then(function(files) {
            return Promise.map(files, function(file) {
                return requirejsOptimize(file, {
                    wrap : false,
                    useStrict : true,
                    optimize : optimizer,
                    optimizeCss : 'standard',
                    pragmas : {
                        debug : debug
                    },
                    baseUrl : 'Source',
                    skipModuleInsertion : true,
                    include : filePathToModuleId(path.relative('Source', file)),
                    out : path.join(combineOutput, path.relative('Source', file))
                });
            }, {concurrency : concurrency});
        })
        .then(function() {
            return globby(['Source/Workers/*.js',
                           '!Source/Workers/cesiumWorkerBootstrapper.js',
                           '!Source/Workers/transferTypedArrayTest.js',
                           '!Source/Workers/createTaskProcessorWorker.js',
                           '!Source/ThirdParty/Workers/*.js']);
        })
        .then(function(files) {
            return Promise.map(files, function(file) {
                return requirejsOptimize(file, {
                    wrap : true,
                    useStrict : true,
                    optimize : optimizer,
                    optimizeCss : 'standard',
                    pragmas : {
                        debug : debug
                    },
                    baseUrl : 'Source',
                    include : filePathToModuleId(path.relative('Source', file)),
                    out : path.join(combineOutput, path.relative('Source', file))
                });
            }, {concurrency : concurrency});
        });
}

function minifyCSS(outputDirectory) {
    return globby('Source/**/*.css').then(function(files) {
        return Promise.map(files, function(file) {
            return requirejsOptimize(file, {
                wrap : true,
                useStrict : true,
                optimizeCss : 'standard',
                pragmas : {
                    debug : true
                },
                cssIn : file,
                out : path.join(outputDirectory, path.relative('Source', file))
            });
        }, {concurrency : concurrency});
    });
}

function streamToPromise(stream) {
    return new Promise(function(resolve, reject) {
        stream.on('finish', resolve);
        stream.on('end', reject);
    });
}