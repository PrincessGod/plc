require(['plc'], function() {
    'user strict';
    //
    // Init
    //
    var tiandituVecLayer = new Cesium.WebMapTileServiceImageryProvider({
        url: 'http://t0.tianditu.com/vec_c/wmts?',
        layer: 'vec',
        style: 'default',
        format: 'tiles',
        tileMatrixSetID: 'c',
        tilingScheme: new Cesium.GeographicTilingScheme(),
        credit: new Cesium.Credit('天地图全球矢量服务'),
        maximumLevel: 17,
        tileMatrixLabels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19']
    });

    var tiandituTextLayer = new Cesium.WebMapTileServiceImageryProvider({
        url: 'http://t0.tianditu.com/cva_c/wmts?',
        layer: 'cva',
        style: 'default',
        format: 'tiles',
        tileMatrixSetID: 'c',
        tilingScheme: new Cesium.GeographicTilingScheme(),
        credit: new Cesium.Credit('天地图全球中文标注'),
        maximumLevel: 17,
        tileMatrixLabels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19']
    });

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