var developMode = true;

if (developMode) {
    require.config({
        //baseUrl: '../Thirdparty/Cesium/Source',
        paths: {
            'plcjs': './js'
            //'plcjs': '../../../Source/js'
        }
    });
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Requirejs Debug mode >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
} else {
    require.config({
        paths: {
            'Cesium': '../Build/Cesium/Cesium',
            'plcjs': './js'
        },
        shim: {
            Cesium: {
                exports: 'Cesium'
            }
        }
    });
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Requirejs Relase mode >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
}

require([
        'Cesium'
    ], function(
        Cesium) {
    'use strict';
    /*global self*/
    var scope = typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : {};

    scope.Cesium = Cesium;
}, undefined, true);

if (typeof Cesium !== "undefined") {
    console.log("Cesium should not be defined at this time.");
} else if (typeof require === "function") {
    require(["plcjs/test"], onload);
}

//>>includeStart('debug', pragmas.debug);
console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Almond Debug mode >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
//>>includeEnd('debug');