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

    Sandcastle.addToolbarButton('Start Measure', function () {
        lineMeasure.startDraw();
    }, 'toolbarbuttons');
    Sandcastle.addToolbarButton('End Measure', function () {
        lineMeasure.endDraw();
    }, 'toolbarbuttons');
    Sandcastle.addToggleButton('ShowVH', false, function (checked) {
        lineMeasure.vhMeasure = checked;
    }, 'toolbarbuttons');

    var lastEntity = {};

    function createModel(url, height) {
        viewer.entities.remove(lastEntity);

        var cartegrao = Cesium.Cartographic.fromCartesian(new Cesium.Cartesian3(-2378169.0658539943, 4457736.679267226, 3884743.8028813666));
        var position = Cesium.Cartesian3.fromRadians(cartegrao.longitude, cartegrao.latitude, height);
        var heading = Cesium.Math.toRadians(135);
        var pitch = 0;
        var roll = 0;
        var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);

        lastEntity = viewer.entities.add({
            name: url,
            position: position,
            orientation: orientation,
            model: {
                uri: url
            }
        });
        viewer.trackedEntity = lastEntity;
    }

    var options = [{
        text: 'Aircraft',
        onselect: function () {
            createModel('./models/CesiumAir/Cesium_Air.glb', 5000.0);
        }
    }, {
        text: 'Ground vehicle',
        onselect: function () {
            createModel('./models/CesiumGround/Cesium_Ground.glb', 0);
        }
    }, {
        text: 'Hot Air Balloon',
        onselect: function () {
            createModel('./models/CesiumBalloon/CesiumBalloon.glb', 1000.0);
        }
    }, {
        text: 'Milk truck',
        onselect: function () {
            createModel('./models/CesiumMilkTruck/CesiumMilkTruck-kmc.glb', 0);
        }
    }, {
        text: 'Skinned character',
        onselect: function () {
            createModel('./models/CesiumMan/Cesium_Man.glb', 0);
        }
    }];

    Sandcastle.addToolbarMenu(options, 'toolbarmenu');
    Sandcastle.addToolbarButton('Home', goHome, 'toolbarmenu');
});
