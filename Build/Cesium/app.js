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
            imageryProvider: Cesium.createTileMapServiceImageryProvider({
                url: Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII')
            }),
            terrainProviderViewModels: undefined,
            terrainProvider: new Cesium.EllipsoidTerrainProvider(),
            sceneMode: Cesium.SceneMode.SCENE3D // Cesium.SceneMode.SCENE2D Cesium.SceneMode.COLUMBUS_VIEW
        });

        var compass = Cesium.PLC.CompassButton(viewer._toolbar, viewer.scene);
    });