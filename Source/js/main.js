var developMode = false;

if (developMode) {
    require.config({
        baseUrl: '../../Thirdparty/Cesium/Source',
        paths: {
            'plcjs': '../../../Source/js'
        }
    });
} else {
    require.config({
        paths: {
            'Cesium': '../../Build/Cesium/Cesium',
            'plcjs': '.'
        },
        shim: {
            Cesium: {
                exports: 'Cesium'
            }
        }
    });
}

if (typeof Cesium !== "undefined") {
    onload(Cesium);
} else if (typeof require === "function") {
    require(["plcjs/test"], onload);
}