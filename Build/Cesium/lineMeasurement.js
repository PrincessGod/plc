requirejs.config({
    waitSeconds: 200
});

require(['plc'], function () {
    'user strict';
    //
    // Init
    //
    document.getElementById('loading-container').style.display = 'none';

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
        imageryProvider: Cesium.MapboxImageryProvider({
            mapId: 'mapbox.streets'
        }),
        terrainProviderViewModels: undefined,
        terrainProvider: new Cesium.EllipsoidTerrainProvider(),
        sceneMode: Cesium.SceneMode.SCENE3D // Cesium.SceneMode.SCENE2D Cesium.SceneMode.COLUMBUS_VIEW
    });

    var compass = new Cesium.PLC.CompassButton(viewer._toolbar, viewer.scene);

    var lineMeasure = new Cesium.PLC.LineMeasure({
        viewer: viewer
    });

    function goHome() {
        viewer.camera.setView({
            destination: new Cesium.Cartesian3(-2378169.0658539943, 4457736.679267226, 3884743.8028813666),
            orientation: {
                heading: 0.0,
                pitch: Cesium.Math.toRadians(-90),
                roll: 0.0
            }
        });
    }

    goHome();

    Sandcastle.addToolbarButton('Start Measurement', function () {
        lineMeasure.startDraw();
    });
    Sandcastle.addToolbarButton('End Measurement', function () {
        lineMeasure.endDraw();
    });
    Sandcastle.addToolbarButton('Home', goHome);
});
