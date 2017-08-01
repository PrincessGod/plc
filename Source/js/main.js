var developMode = false;

if (developMode) {
    require.config({
    	baseUrl: '../../Cesium/Source'
    });
} else {
    require.config({
        paths: {
            'Cesium': '../../Cesium/Build/Cesium/Cesium'
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
    require(["Cesium"], onload);
}