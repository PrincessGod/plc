    require(['plc'], function() {
        'user strict';

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
            imageryProvider: new Cesium.WebMapTileServiceImageryProvider({
                url: 'http://t0.tianditu.com/vec_c/wmts?',
                layer: 'vec',
                style: 'default',
                format: 'tiles',
                tileMatrixSetID: 'c',
                tilingScheme: new Cesium.GeographicTilingScheme(),
                credit: new Cesium.Credit('天地图全球矢量服务'),
                maximumLevel: 17,
                tileMatrixLabels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19']
            }),
            terrainProviderViewModels: undefined,
            terrainProvider: new Cesium.EllipsoidTerrainProvider(),
            sceneMode: Cesium.SceneMode.SCENE3D // Cesium.SceneMode.SCENE2D Cesium.SceneMode.COLUMBUS_VIEW
        });

        viewer.imageryLayers.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({
            url: 'http://t0.tianditu.com/cva_c/wmts?',
            layer: 'cva',
            style: 'default',
            format: 'tiles',
            tileMatrixSetID: 'c',
            tilingScheme: new Cesium.GeographicTilingScheme(),
            credit: new Cesium.Credit('天地图全球中文标注'),
            maximumLevel: 17,
            tileMatrixLabels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19']
        }));

        var compass = new Cesium.PLC.CompassButton(viewer._toolbar, viewer.scene);
    });