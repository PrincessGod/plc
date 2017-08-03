require.config({
    paths: {
        'plcjs': './js'
    }
});

if (typeof Cesium !== "undefined") {
    console.log("Cesium should not be defined at this time.");
} else if (typeof require === "function") {
    require(["plcjs/test"], onload);
}