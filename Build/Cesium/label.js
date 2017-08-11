require(['plc'], function() {
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
        imageryProvider: Cesium.createTileMapServiceImageryProvider({
            url: Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII')
        }),
        terrainProviderViewModels: undefined,
        terrainProvider: new Cesium.EllipsoidTerrainProvider(),
        sceneMode: Cesium.SceneMode.SCENE3D // Cesium.SceneMode.SCENE2D Cesium.SceneMode.COLUMBUS_VIEW
    });

    var compass = new Cesium.PLC.CompassButton(viewer._toolbar, viewer.scene);
    var positions = Cesium.Cartesian3.fromDegreesArrayHeights([-115.0, 37.0, 100000.0, -107.0, 33.0, 0.0]);
    var label1 = {};
    var label2 = new Cesium.PLC.DOMLabel({
        position: positions[1],
        text: "hello world 2",
        name: "label2"
    });

    var addLabel = function() {
        if (viewer.domLabels.values.length === 0) {
            label1 = viewer.domLabels.add({
                position: positions[0],
                text: "hello world 1"
            });
        } else if (viewer.domLabels.values.length === 1) {
            viewer.domLabels.add(label2);
        }
    };

    var removeLabel = function() {
        if (viewer.domLabels.values.length === 1) {
            viewer.domLabels.remove(label1);
        } else if (viewer.domLabels.values.length === 2) {
            viewer.domLabels.remove(label2);
        }
    };

    Sandcastle.addToolbarButton('AddLabel', addLabel, 'toolbarbuttons');
    Sandcastle.addToolbarButton('RemoveLabel', removeLabel, 'toolbarbuttons');
    Sandcastle.addToggleButton('ShowLabel1', true, function(checked) {
        label1.show = checked;
    });
    Sandcastle.addToggleButton('ShowLabels', true, function(checked) {
        viewer.domLabels.show = checked;
    });
});