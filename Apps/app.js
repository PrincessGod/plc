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
            imageryProvider : new Cesium.WebMapTileServiceImageryProvider({
                url : 'http://t0.tianditu.com/vec_c/wmts?',
                layer : 'vec',
                style : 'default',
                format : 'tiles',
                tileMatrixSetID : 'c',
                tilingScheme : new Cesium.GeographicTilingScheme(),
                credit : new Cesium.Credit('天地图矢量地图'),
                maximumLevel : 17,
                tileMatrixLabels:['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19']
            }),
            terrainProviderViewModels: undefined,
            terrainProvider: new Cesium.EllipsoidTerrainProvider(),
            sceneMode: Cesium.SceneMode.SCENE3D // Cesium.SceneMode.SCENE2D Cesium.SceneMode.COLUMBUS_VIEW
        });

        var compass = new Cesium.PLC.CompassButton(viewer._toolbar, viewer.scene);
    });