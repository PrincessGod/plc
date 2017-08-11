require.config({
    paths: {
        'plcjs': './Plc'
    }
});


if (typeof Cesium !== "undefined") {
    console.log("Cesium should not be defined at this time.");
} else if (typeof require === "function") {
    require(['plcjs/plc'], function(Cesium) {
        this.viewer = new Cesium.Viewer('cesiumContainer', {
            // Wedgets
            animation: false,
            timeline: false,
            fullscreenButton: false,
            geocoder: false,
            homeButton: false,
            navigationHelpButton: false,
            baseLayerPicker: false,
            sceneModePicker: true,
            infoBox: false,
            selectionIndicator: false,
            creditContainer: document.createElement('DIV'),

            // Display
            imageryProvider: Cesium.createTileMapServiceImageryProvider({
                url: Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII')
            }),
            terrainProviderViewModels: undefined,
            terrainProvider: new Cesium.EllipsoidTerrainProvider(),
            sceneMode: Cesium.SceneMode.SCENE3D // Cesium.SceneMode.SCENE2D Cesium.SceneMode.COLUMBUS_VIEW
        });
        this.Cesium = Cesium;
        var compass = new Cesium.PLC.CompassButton(viewer._toolbar, viewer.scene);
    });
}