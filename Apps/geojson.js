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

    var compass = new Cesium.PLC.CompassButton(viewer._toolbar, viewer.scene);

    loadLines('./models/test1/color1point.json');
    loadLines('./models/test1/color2point.json');
    loadLines('./models/test1/color3point.json');
    loadStations('./models/test1/trains.json');

    var isLoaded = false;
    Sandcastle.addToolbarButton('Load Detile', function () {
        if (isLoaded) {
            return;
        }
        loadMileStone('./models/test1/test1.json');
        isLoaded = true;
    }, 'toolbarbuttons');

    function loadLines(url) {
        var promise = Cesium.GeoJsonDataSource.load(url, {
            strokeWidth: 3
        });

        promise.then(function (dataSource) {
            viewer.dataSources.add(dataSource);
            var entities = dataSource.entities.values;

            for (var i = 0; i < entities.length; i++) {
                var entity = entities[i];

                entity.polyline.material = new Cesium.PolylineDashMaterialProperty({
                    color: Cesium.Color.BLACK,
                    gapColor: Cesium.Color.WHITE
                });

                entity.polyline.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(0.0, 1000000.0);
            }
        });
    }

    function loadStations(url) {
        var promise = Cesium.GeoJsonDataSource.load(url);

        promise.then(function (dataSource) {
            viewer.dataSources.add(dataSource);
            var entities = dataSource.entities.values;

            for (var i = 0; i < entities.length; i++) {
                var entity = entities[i];

                entity.billboard = undefined;
                entity.label = {
                    font: '30px sans-serif,SimSun',
                    text: entity.name,
                    fillColor: Cesium.Color.GOLD,
                    pixelOffset: new Cesium.Cartesian2(0, -1.0),
                    pixelOffsetScaleByDistance: new Cesium.NearFarScalar(1.5e2, 40, 4.0e6, 0.0),
                    scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 4.0e6, 0.0),
                };
                entity.billboard = {
                    image: './models/test1/trainstation.png',
                    scaleByDistance: new Cesium.NearFarScalar(1.5e2, 0.08, 4.0e6, 0.0),
                };
            }
        }).otherwise(function (err) {
            console.log(err);
        });
    }

    function loadMileStone(url) {
        var promise = Cesium.GeoJsonDataSource.load(url);

        promise.then(function (dataSource) {
            viewer.dataSources.add(dataSource);
            var entities = dataSource.entities.values;

            for (var i = 0; i < entities.length; i++) {
                var entity = entities[i];

                entity.billboard = undefined;
                entity.label = {
                    font: '20px sans-serif,"Microsoft YaHei"',
                    text: i.toString(),
                    fillColor: Cesium.Color.WHITE,
                    scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 5.0e4, 0.0),
                };
            }
        }).otherwise(function (err) {
            console.log(err);
        });
    }

    var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    var selected = {};
    handler.setInputAction(function onLeftClick(movement) {
        // Pick a new feature
        var pickedFeature = viewer.scene.pick(movement.position);
        if (!Cesium.defined(pickedFeature)) {
            return;
        }

        // Select the feature if it's not already selected
        if (selected.feature === pickedFeature) {
            return;
        }
        selected.feature = pickedFeature;

        console.log(pickedFeature.id.name, pickedFeature);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    handler.setInputAction(function (movement) {
        var pickedFeature = viewer.scene.pick(movement.position);
        if (!Cesium.defined(pickedFeature)) {
            viewer.trackedEntity = undefined;
        }
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    viewer.camera.setView({
        destination: new Cesium.Cartesian3(-2724637.45253876, 5370570.762067107, 4276185.009626301)
    });
});
