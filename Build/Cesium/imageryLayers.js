require(['plc'], function() {
    'user strict';
    //
    // Init
    //
    var tiandituVecLayer = new Cesium.PLC.TiandituVecImageryProvider();
    tiandituVecLayer = tiandituVecLayer && tiandituVecLayer.imageryProvider;
    var tiandituTextLayer = new Cesium.PLC.TiandituTextImageryProvider();
    tiandituTextLayer = tiandituTextLayer && tiandituTextLayer.imageryProvider;
    var mapBoxImgLayer = new Cesium.MapboxImageryProvider({
        mapId: 'mapbox.streets'
    });
    var openStreetMapLayer = new Cesium.createOpenStreetMapImageryProvider({
        url: 'https://a.tile.openstreetmap.org/'
    });
    var ESRIWorldImageLayer = new Cesium.ArcGisMapServerImageryProvider({
        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
        enablePickFeatures: false
    });

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
        imageryProvider: tiandituVecLayer,
        terrainProviderViewModels: undefined,
        terrainProvider: new Cesium.EllipsoidTerrainProvider(),
        sceneMode: Cesium.SceneMode.SCENE3D // Cesium.SceneMode.SCENE2D Cesium.SceneMode.COLUMBUS_VIEW
    });

    viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(114.0, 37, 20000000),
        orientation: {
            heading: 0.0,
            pitch: -Cesium.Math.PI_OVER_TWO,
            roll: 0.0
        }
    });

    var compass = new Cesium.PLC.CompassButton(viewer._toolbar, viewer.scene);

    // Add text label
    var imageryLayers = viewer.imageryLayers;
    imageryLayers.addImageryProvider(tiandituTextLayer);

    // Add selector
    Sandcastle.addDefaultToolbarMenu([{
        text: '天地图矢量和中文地标',
        onselect: function() {
            imageryLayers.removeAll(false);
            imageryLayers.addImageryProvider(tiandituVecLayer);
            imageryLayers.addImageryProvider(tiandituTextLayer);
        }
    }, {
        text: 'MapBox道路图',
        onselect: function() {
            imageryLayers.removeAll(false);
            imageryLayers.addImageryProvider(mapBoxImgLayer);
        }
    }, {
        text: 'OpenStreetMap道路图',
        onselect: function() {
            imageryLayers.removeAll(false);
            imageryLayers.addImageryProvider(openStreetMapLayer);
        }
    }, {
        text: 'ESRI影像图',
        onselect: function() {
            imageryLayers.removeAll(false);
            imageryLayers.addImageryProvider(ESRIWorldImageLayer);
        }
    }]);
});