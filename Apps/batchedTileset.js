requirejs.config({
    waitSeconds: 200
});

require(['plc'], function () {
    'user strict';
    //
    // Init
    //
    document.getElementById('loading-container').style.display = 'none';

    var viewer = new Cesium.Viewer('cesiumContainer', {
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
        imageryProvider: Cesium.ArcGisMapServerImageryProvider({
            url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
            enablePickFeatures: false
        }),
        terrainProviderViewModels: undefined,
        terrainProvider: new Cesium.EllipsoidTerrainProvider(),
        sceneMode: Cesium.SceneMode.SCENE3D // Cesium.SceneMode.SCENE2D Cesium.SceneMode.COLUMBUS_VIEW
    });
    var scene = viewer.scene;
    var compass = new Cesium.PLC.CompassButton(viewer._toolbar, viewer.scene);
    viewer.extend(Cesium.viewerCesium3DTilesInspectorMixin);
    var inspectorViewModel = viewer.cesium3DTilesInspector.viewModel;

    tileset = new Cesium.Cesium3DTileset({
        url: './models/BatchedTileset'
    });
    inspectorViewModel.tileset = tileset;
    scene.primitives.add(tileset);
    tileset.readyPromise.then(function(tileset) {
        var boundingSphere = tileset.boundingSphere;
        var range = Math.max(100.0 - boundingSphere.radius, 0.0); // Set a minimum offset of 100 meters
        viewer.camera.viewBoundingSphere(boundingSphere, new Cesium.HeadingPitchRange(0, -2.0, range));
        viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    }).otherwise(function(error) {
        throw(error);
    });

    var handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
    var div = document.getElementById('toolbar');
    var p = document.createElement('p');
    div.innerHTML = '';
    div.appendChild(p);
    div.style.display = 'none';
    p.style.color = 'white';
    p.style.whiteSpace = 'pre';
    p.style.margin = '6px 10px';
    handler.setInputAction(function() {
        var feature = inspectorViewModel.feature;
        if (Cesium.defined(feature)) {
            var propertyNames = feature.getPropertyNames();
            var length = propertyNames.length;
            p.textContent = '';
            div.style.display = 'block';
            for (var i = 0; i < length; ++i) {
                var propertyName = propertyNames[i];
                var propertyString = propertyName + ': ' + feature.getProperty(propertyName);
                console.log(propertyString);
                p.textContent = p.textContent.concat(propertyString + '\r\n');
            }
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
});
