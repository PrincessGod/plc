define([
    '../../Core/DeveloperError',
    '../../Core/defineProperties',
    '../../Core/Check',
    '../../Core/defined',
    '../../Core/Cartesian3',
    '../../Core/Cartographic',
    '../../DataSources/CallbackProperty',
    '../../Core/Color',
    '../../Core/defaultValue',
    '../../Core/ScreenSpaceEventHandler',
    '../../Core/ScreenSpaceEventType',
    '../../Scene/SceneMode',
    '../../Core/PolygonPipeline',
    '../../Core/Event'
], function (
    DeveloperError,
    defineProperties,
    Check,
    defined,
    Cartesian3,
    Cartographic,
    CallbackProperty,
    Color,
    defaultValue,
    ScreenSpaceEventHandler,
    ScreenSpaceEventType,
    SceneMode,
    PolygonPipeline,
    Event) {
    'use strect';

    /**
     * A ploygon area measurement tool, can measure ploygon area and the ground cover area(surface area).
     * 
     * @alias PolygonMeasure
     * @constructor
     * 
     * @param {Object} options Object with the following properties:
     * @param {viewer} options.viewer The viewer instance to use.
     * @param {DOMLabelCollection} [options.labelCollection=options.viewer.domLabels] The label collection to contain the area labels.
     * @param {Boolean} [options.showSurface=false] While true, after drawing polygon will draw the ground cover area of polygon, false otherwise.
     * @param {String} [options.areaLabelClassName="plc-polygon-area-label"] The element calssName property of {@link DOMLabel} object, which will show in the center of painted polygon.
     * @param {String} [options.surfaceAreaLabelClassName="plc-polygon-surface-area-label"] The element calssName property of DOMLabel object, which will show in the center of the surface polygon while options.showSurface is true.
     * @param {Color} [options.drawingPolygonFill=Color.fromBytes(1, 186, 239, 200)] The fill color of drawing polygon, which will show after begin drawing and before finish drawing.
     * @param {Color} [options.drawingPolygonStroke=Color.fromBytes(23, 125, 184, 200)] The outline color of drawing polygon, which will show after begin drawing and before finish drawing.
     * @param {Color} [options.drawingPolylineColor=Color.RED] The color of drawing polyline, which contant the picked points.
     * @param {Color} [options.surfacePolygonFill=Color.fromBytes(231, 201, 105, 200)] The fill color of surface polygon, which will show when options.showSurface = true.
     * @param {Color} [options.surfacePolygonStroke=Color.fromBytes(225, 224, 186, 200)] The outline color of surface polygon, which will show when options.showSurface = true.
     * @param {Color} [options.paintedPolygonFill=Color.fromBytes(104, 200, 200, 200)] The fill color of painted polygon, which will show when finish drawing.
     * @param {Color} [options.paintedPolygonStroke=Color.fromBytes(23, 125, 184, 200)] The outline color of painted polygon, which will show when finish drawing.
     * 
     * @demo {@link http://princessgod.com/plc/lineMeasurement|Line Measurement Demo}
     * 
     * @see DOMLabel
     * @see DOMLabelCollection
     */
    function PolygonMeasure(options) {
        //>>includeStart('debug', pragmas.debug);
        Check.defined('options', options);
        Check.defined('options.viewer', options.viewer);
        if (!defined(options.labelCollection) && !defined(options.viewer.domLabels)) {
            throw new DeveloperError('options.labelCollection is required');
        }
        //>>includeEnd('debug');

        this._viewer = options.viewer;
        this._scene = options.viewer.scene;
        this._labelCollection = defined(options.labelCollection) ? options.labelCollection : options.viewer.domLabels;
        this._drawHandler = new ScreenSpaceEventHandler(this._viewer.canvas);
        this._paintedPolygons = [];
        this._isActive = false;
        this._areaLabelClassName = defaultValue(options.areaLabelClassName, 'plc-polygon-area-label');
        this._surfaceAreaLabelClassName = defaultValue(options.surfaceAreaLabelClassName, 'plc-polygon-surface-area-label');
        this._showSurface = defaultValue(options.showSurface, false);
        this._drawingPolygonFill = defined(options.drawingPolygonFill) ? options.drawingPolygonFill : Color.fromBytes(1, 186, 239, 200);
        this._drawingPolygonStroke = defined(options.drawingPolygonStroke) ? options.drawingPolygonStroke : Color.fromBytes(23, 125, 184, 200);
        this._drawingPolylineColor = defined(options.drawingPolylineColor) ? options.drawingPolylineColor : Color.RED;
        this._surfacePolygonFill = defined(options.surfacePolygonFill) ? options.surfacePolygonFill : Color.fromBytes(231, 201, 105, 200);
        this._surfacePolygonStroke = defined(options.surfacePolygonStroke) ? options.surfacePolygonStroke : Color.fromBytes(225, 224, 186, 200);
        this._paintedPolygonFill = defined(options.paintedPolygonFill) ? options.paintedPolygonFill : Color.fromBytes(104, 200, 200, 200);
        this._paintedPolygonStroke = defined(options.paintedPolygonStroke) ? options.paintedPolygonStroke : Color.fromBytes(23, 125, 184, 200);

        this._polygonPainted = new Event();

        this._status = {
            isStarted: false,
            pointsCartesian3: [],
            currentCartesian3: new Cartesian3(),
            pointsSurface: [],
            currentSurface: new Cartesian3(),
        };

        var that = this;
        this._drawingSurface = options.viewer.entities.add({
            name: 'PLC_POLYGON_MEASURE_SURFACE',
            polygon: {
                hierarchy: new CallbackProperty(function () {
                    if (that._showSurface) {
                        return getSurfacePoints(that._status);
                    }
                }, false),
                material: that._surfacePolygonFill,
                height: 0,
                outline: true,
                outlineColor: that._surfacePolygonStroke,
                perPositionHeight: false,
            }
        });

        this._drawingPolygon = options.viewer.entities.add({
            name: 'PLC_POLYGON_MEASURE_POLYGON',
            polygon: {
                hierarchy: new CallbackProperty(function () {
                    return getDrawingPoints(that._status);
                }, false),
                material: that._drawingPolygonFill,
                outline: true,
                outlineColor: that._drawingPolygonStroke,
                perPositionHeight: true,
            }
        });

        this._drawingPolyline = options.viewer.entities.add({
            name: 'PLC_POLYGON_MEASURE_POLYLINE',
            polyline: {
                positions: new CallbackProperty(function () {
                    return getDrawingPoints(that._status);
                }, false),
                material: that._drawingPolylineColor
            }
        });
    }

    /**
     * The signature of the event generated by {@link PolygonMeasure#polygonPainted}.
     * @function
     * @param {Object} polygon The painted polygon entity and area label, {polygon: {@link Entity}, label: {@link DOMLabel}}.
     * @param {Object} surface The painted surface polygon entity and area label if {@link PolygonMeasure#showSurface} is true.
     * If not painted then return undefined, otherwise returen {polygon: {@link Entity}, label: {@link DOMLabel}}.
     */
    PolygonMeasure.polygonPaintedEventCallback = undefined;

    defineProperties(PolygonMeasure.prototype, {
        /**
         * Gets the viewer instance.
         * @memberof PolygonMeasure.prototype
         * 
         * @type {Viewer}
         * @readonly
         */
        viewer: {
            get: function () {
                return this._viewer;
            }
        },

        /**
         * Gets the label collection of the tool.
         * @memberof PolygonMeasure.prototype
         * 
         * @type {DOMLabelCollection}
         * @readonly
         */
        labelCollection: {
            get: function () {
                return this._labelCollection;
            }
        },

        /**
         * Gets the status of the tool.
         * @memberof PolygonMeasure.prototype
         * 
         * @type {Object}
         * @readonly
         */
        status: {
            get: function () {
                return this._status;
            }
        },

        /**
         * Gets the panted polygon entities and area labels.
         * @memberof PolygonMeasure.prototype
         * 
         * @type {Array}
         * @readonly
         * 
         * @example
         * 
         * // Get the first painted polygon and label
         * var paintedItem = polygonMeasure.paintedPolygons[0];
         * 
         * // Get the ploygon object
         * var polygon = paintedItem.polygon;
         * 
         * // Get the label object
         * var label = paintedItem.label;
         * 
         */
        paintedPolygons: {
            get: function () {
                return this._paintedPolygons;
            }
        },

        /**
         * Gets or sets whether show surface polygon or not.
         * @memberof PolygonMeasure.prototype
         * 
         * @type {Boolean}
         * @default false
         */
        showSurface: {
            get: function () {
                return this._showSurface;
            },
            set: function (value) {
                //>>includeStart('debug', pragmas.debug);
                Check.typeOf.bool('showSurface', value);
                //>>includeEnd('debug');

                this._showSurface = value;
            }
        },

        /**
         * Gets the event that is fired when polygons are added.
         * The generated event is a {@link PolygonMeasure.polygonPaintedEventCallback}.
         * 
         * @memberof PolygonMeasure.prototype
         * @readonly
         * @type {Event}
         * 
         * @example
         * 
         * // Get the event
         * var polygonPaintedEvent = polygonMeasure.polygonPainted;
         * 
         * // Implement the handler
         * function polygonPaintedHandler(polygon, surface) {
         *     console.log(polygon, surface);
         * }
         * 
         * // Add handler to event
         * polygonPaintedEvent.addEventListener(polygonPaintedHandler);
         * 
         */
        polygonPainted: {
            get: function () {
                return this._polygonPainted;
            }
        },

        /**
         * Gets the tool is active or not. When call {@link PolygonMeasure#startDraw} will set it to true,
         * call {@link PolygonMeasure#endDraw} set to false.
         * 
         * @memberof PolygonMeasure.prototype
         * @type {Boolean}
         * @default false
         * @readonly
         */
        isActive: {
            get: function () {
                return this._isActive;
            }
        }
    });

    function getDrawingPoints(status) {
        return status.pointsCartesian3.concat(status.currentCartesian3);
    }

    function getSurfacePoints(status) {
        return status.pointsSurface.concat(status.currentSurface);
    }

    function getPolygonArea(entity) {
        var polygon = entity.polygon;
        var hierarchy = polygon.hierarchy._value;

        // Get triangles vertext points
        var indices = PolygonPipeline.triangulate(hierarchy);
        var area = 0;

        for (var i = 0; i < indices.length; i += 3) {
            var vector1 = hierarchy[indices[i]];
            var vector2 = hierarchy[indices[i + 1]];
            var vector3 = hierarchy[indices[i + 2]];

            // These vectors define the sides of a parallelogram (double the size of the triangle)
            var vectorC = Cesium.Cartesian3.subtract(vector2, vector1, new Cesium.Cartesian3());
            var vectorD = Cesium.Cartesian3.subtract(vector3, vector1, new Cesium.Cartesian3());

            // Area of parallelogram is the cross product of the vectors defining its sides
            var areaVector = Cesium.Cartesian3.cross(vectorC, vectorD, new Cesium.Cartesian3());

            // Area of the triangle is just half the area of the parallelogram, add it to the sum.
            area += Cesium.Cartesian3.magnitude(areaVector) / 2.0;
        }

        return area;
    }

    function getPolygonCenter(entity) {
        var polygon = entity.polygon;
        var hierarchy = polygon.hierarchy._value;

        var maxPoint = Cartographic.fromCartesian(hierarchy[0]);
        var minPoint = Cartographic.fromCartesian(hierarchy[0]);

        for (var index = 1; index < hierarchy.length; index++) {
            var cartographic = Cartographic.fromCartesian(hierarchy[index]);

            maxPoint.longitude = maxPoint.longitude > cartographic.longitude ? maxPoint.longitude : cartographic.longitude;
            maxPoint.latitude = maxPoint.latitude > cartographic.latitude ? maxPoint.latitude : cartographic.latitude;
            maxPoint.height = maxPoint.height > cartographic.height ? maxPoint.height : cartographic.height;

            minPoint.longitude = minPoint.longitude < cartographic.longitude ? minPoint.longitude : cartographic.longitude;
            minPoint.latitude = minPoint.latitude < cartographic.latitude ? minPoint.latitude : cartographic.latitude;
            minPoint.height = minPoint.height < cartographic.height ? minPoint.height : cartographic.height;
        }

        return Cartesian3.fromRadians(
            (maxPoint.longitude + minPoint.longitude) / 2,
            (maxPoint.latitude + minPoint.latitude) / 2,
            (maxPoint.height + minPoint.height) / 2,
        );
    }

    var featureScratch = {};
    var pickRayScratch = {};
    var pickPositionScratch = {};

    function getPickPositionFromFeatures(tool, windowPosition) {
        pickPositionScratch = tool._scene.pickPosition(windowPosition);
        if (!pickPositionScratch || Cartographic.fromCartesian(pickPositionScratch).height < 0) {
            pickRayScratch = tool._scene.camera.getPickRay(windowPosition);

            // Possible be undefine
            pickPositionScratch = tool._scene.globe.pick(pickRayScratch, tool._scene);
        }
        return pickPositionScratch;
    }

    function getPickPositionFromEllipsoid(tool, windowPosition) {
        pickRayScratch = tool._scene.camera.getPickRay(windowPosition);

        // Possible be undefine
        pickPositionScratch = tool._scene.globe.pick(pickRayScratch, tool._scene);
        return pickPositionScratch;
    }

    function getPickPosition(tool, windowPosition) {
        if (tool._scene.mode === SceneMode.SCENE3D) {
            featureScratch = tool._scene.pick(windowPosition);
            if (featureScratch && tool._scene.pickPositionSupported) {
                pickPositionScratch = getPickPositionFromFeatures(tool, windowPosition);
            } else {
                pickPositionScratch = getPickPositionFromEllipsoid(tool, windowPosition);
            }
            return pickPositionScratch;
        }
    }

    function getAreaString(area) {
        if (area < 1) {
            return (area * 100).toFixed(2) + ' dm²';
        }
        if (area < 1000000) {
            return area.toFixed(2) + ' m²';
        }
        return (area / 1000000).toFixed(2) + ' km²';
    }

    function paintSurface(tool) {
        var surface = tool._currentPolyline = tool._viewer.entities.add({
            name: 'plc-polygon-measure-surface-' + tool._paintedPolygons.length,
            polygon: {
                hierarchy: tool._status.pointsSurface,
                material: tool._surfacePolygonFill,
                height: 0,
                outline: true,
                outlineColor: tool._surfacePolygonStroke
            }
        });

        var areaLabel = tool._labelCollection.add({
            name: 'plc-polygon-measure-surface-' + tool._paintedPolygons.length,
            position: getPolygonCenter(surface),
            text: getAreaString(getPolygonArea(surface)),
            className: tool._surfaceAreaLabelClassName
        });

        tool._paintedPolygons.push({
            polygon: surface,
            label: areaLabel
        });

        var length = tool._paintedPolygons.length;
        var paintedPolygon = tool._paintedPolygons[length - 2];
        var paintedSurface = tool._paintedPolygons[length - 1];
        tool._polygonPainted.raiseEvent(paintedPolygon, paintedSurface);
    }

    function paintePolygon(tool) {
        var polygon = tool._currentPolyline = tool._viewer.entities.add({
            name: 'plc-polygon-measure-painted-' + tool._paintedPolygons.length,
            polygon: {
                hierarchy: tool._status.pointsCartesian3,
                material: tool._paintedPolygonFill,
                outline: true,
                outlineColor: tool._paintedPolygonStroke,
                perPositionHeight: true,
            }
        });

        var areaLabel = tool._labelCollection.add({
            name: 'plc-polygon-measure-painted-' + tool._paintedPolygons.length,
            position: getPolygonCenter(polygon),
            text: getAreaString(getPolygonArea(polygon)),
            className: tool._areaLabelClassName
        });

        tool._paintedPolygons.push({
            polygon: polygon,
            label: areaLabel
        });

        if (tool._showSurface) {
            paintSurface(tool);
        } else {
            var length = tool._paintedPolygons.length;
            var paintedPolygon = tool._paintedPolygons[length - 1];
            tool._polygonPainted.raiseEvent(paintedPolygon);
        }
    }

    function resetStatus(status) {
        status.isStarted = false;
        status.pointsCartesian3 = [];
        status.currentCartesian3 = new Cartesian3();
        status.pointsSurface = [];
        status.currentSurface = new Cartesian3();
    }

    var surfaceScratch = {};
    var cartographicScratch = {};

    function startDrawing(tool, pickPosition) {
        tool._status.pointsCartesian3.push(pickPosition);
        tool._status.currentCartesian3 = pickPosition;

        cartographicScratch = Cartographic.fromCartesian(pickPosition);
        if (cartographicScratch) {
            surfaceScratch = Cartesian3.fromRadians(cartographicScratch.longitude, cartographicScratch.latitude);
            tool._status.pointsSurface.push(surfaceScratch);
            tool._status.currentSurface = surfaceScratch;
        }

        tool._status.isStarted = true;
    }

    function finishDrawing(tool) {
        if (tool._status.pointsCartesian3.length > 2) {
            paintePolygon(tool);
        }
        resetStatus(tool._status);
    }

    function pickPoint(tool, pickPosition) {
        tool._status.pointsCartesian3.push(pickPosition);

        cartographicScratch = Cartographic.fromCartesian(pickPosition);
        if (cartographicScratch) {
            tool._status.currentSurface = Cartesian3.fromRadians(cartographicScratch.longitude, cartographicScratch.latitude);
            tool._status.pointsSurface.push(tool._status.currentSurface);
        }
    }

    function updateCurttentPoint(tool, pickPosition) {
        tool._status.currentCartesian3 = pickPosition;

        cartographicScratch = Cartographic.fromCartesian(pickPosition);
        if (cartographicScratch) {
            tool._status.currentSurface = Cartesian3.fromRadians(cartographicScratch.longitude, cartographicScratch.latitude);
        }
    }

    function mouseLeftClick(tool, movement) {
        pickPositionScratch = getPickPosition(tool, movement.position);
        if (pickPositionScratch) {
            if (!tool._status.isStarted) {
                startDrawing(tool, pickPositionScratch);
            } else {
                pickPoint(tool, pickPositionScratch);
            }
        }
    }

    function mouseRightClick(tool) {
        if (tool._status.isStarted) {
            finishDrawing(tool);
        }
    }

    function mouseMove(tool, movement) {
        if (tool._status.isStarted) {
            pickPositionScratch = getPickPosition(tool, movement.endPosition);
            if (pickPositionScratch) {
                updateCurttentPoint(tool, pickPositionScratch);
            }
        }
    }

    function setHandler(tool) {
        var handler = tool._drawHandler;

        handler.setInputAction(function (movement) {
            mouseLeftClick(tool, movement);
        }, ScreenSpaceEventType.LEFT_CLICK);
        handler.setInputAction(function () {
            mouseRightClick(tool);
        }, ScreenSpaceEventType.RIGHT_CLICK);
        handler.setInputAction(function (movement) {
            mouseMove(tool, movement);
        }, ScreenSpaceEventType.MOUSE_MOVE);
    }

    function destroyHandler(handler) {
        if (!handler.isDestroyed()) {
            handler.destroy();
        }
    }

    function renewHandler(tool) {
        destroyHandler(tool._drawHandler);
        tool._drawHandler = new ScreenSpaceEventHandler(tool._viewer.canvas);
    }

    /**
     * Start drawing polygon, left click add point, right click finish draw.
     * The drawed polygon will displaye with area label after finish.
     * If {@link PolygonMeasure#showSurface} is true, will painted ground cover polygon after finish.
     */
    PolygonMeasure.prototype.startDraw = function () {
        renewHandler(this);
        setHandler(this);
        this._isActive = true;
    };

    /**
     * Stop measure tool, cancel curent drawing if not finished.
     * Keep finished polygons and labels.
     */
    PolygonMeasure.prototype.endDraw = function () {
        destroyHandler(this._drawHandler);
        resetStatus(this._status);
        this._isActive = false;
    };

    /**
     * Clear the painted polygon entities and labels. Make sure the {@link PolygonMeasure#isActive} is false when call it.
     * 
     * @exception {DeveloperError} Try clear history when PolygonMeasure tool is active.
     */
    PolygonMeasure.prototype.clearHistory = function () {
        //>>includeStart('debug', pragmas.debug);
        if (this._isActive) {
            throw new DeveloperError('Try clear history when PolygonMeasure tool is active.');
        }
        //>>includeEnd('debug');

        var entities = this._viewer.entities;
        for (var index = 0; index < this._paintedPolygons.length; index++) {
            var polygon = this._paintedPolygons[index];
            entities.remove(polygon.polygon);
            this._labelCollection.remove(polygon.label);
        }
        this._paintedPolygons = [];
    };
    return PolygonMeasure;
});
