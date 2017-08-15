define([
    '../../Core/DeveloperError',
    '../../Core/defineProperties',
    '../../Core/defined',
    '../../Core/Cartesian3',
    '../../Core/Cartographic',
    '../../Core/EllipsoidGeodesic',
    '../../Core/Color',
    '../../DataSources/CallbackProperty',
    '../../Core/ScreenSpaceEventHandler',
    '../../Scene/SceneMode',
    '../../Core/ScreenSpaceEventType',
    '../../Core/defaultValue'
], function (
    DeveloperError,
    defineProperties,
    defined,
    Cartesian3,
    Cartographic,
    EllipsoidGeodesic,
    Color,
    CallbackProperty,
    ScreenSpaceEventHandler,
    SceneMode,
    ScreenSpaceEventType,
    defaultValue) {
    'use strict';

    /**
     * A line distance measure tool, provide distance between two picked points and draw the line.
     * 
     * @alias LineMeasure
     * @constructor
     * 
     * @param {Object} options Object with the following properties:
     * @param {Viewer} options.viewer The viewer will interact with.
     * @param {DOMLabelCollection} [options.labelCollection=options.viewer.domLabels] The label collection will contain the mature result label.
     * @param {String} [options.drawingLabelClassName="plc-line-mesaure-drawing-label"] The element calssName property of the {@link DOMLabel} which will show when drawing line.
     * @param {String} [options.measureLabelClassName="plc-line-measure-label"] The element className property of the {@link DOMLabel} which will contain the distance result when finsh draw.
     * 
     * @see DOMLabel
     * @see DOMLabelCollection
     */
    function LineMeasure(options) {
        //>>includeStart('debug', pragmas.debug);
        if (!defined(options)) {
            throw new DeveloperError('options is required');
        }
        if (!defined(options.viewer)) {
            throw new DeveloperError('options.viewer is required');
        }
        if (!defined(options.labelCollection) && !defined(options.viewer.domLabels)) {
            throw new DeveloperError('options.labelCollection is required');
        }
        //>>includeEnd('debug');

        var status = {
            isStarted: false,
            isFinished: false,
            startCartesian3: new Cartesian3(),
            endCartesian3: new Cartesian3(),
            startCartographic: new Cartographic(),
            endCartographic: new Cartographic(),
            middleCartesian3: new Cartesian3(),
            geodesic: new EllipsoidGeodesic(),
            currentLength: 0,
            scratch: {},
        };
        this._viewer = options.viewer;
        this._labelCollection = defaultValue(options.labelCollection, options.viewer.domLabels);
        this._scene = viewer.scene;
        this._status = status;
        this._paintedLines = [];
        this._drawingLabelClassName = defaultValue(options.drawingLabelClassName, 'plc-line-mesaure-drawing-label');
        this._measureLabelClassName = defaultValue(options.measureLabelClassName, 'plc-line-measure-label');

        var that = this;
        this._drawingLine = viewer.entities.add({
            polyline: {
                positions: new CallbackProperty(function () {
                    if (that._status.isStarted) {
                        return [that._status.startCartesian3, that._status.endCartesian3];
                    }
                }, false),
                width: 5,
                material: Color.HOTPINK
            }
        });
        this._drawHandler = new ScreenSpaceEventHandler(viewer.canvas);
        this._drawingLable = this._labelCollection.add({
            position: this._status.endCartesian3,
            text: this._status.currentLength + ' m',
            show: false,
            className: this._drawingLabelClassName,
            vOffset: -10
        });
        this._currentLine = viewer.entities.add({
            polyline: {
                positions: [that._status.startCartesian3, that._status.endCartesian3],
                width: 5,
                material: Color.MEDIUMTURQUOISE
            }
        });
    }

    defineProperties(LineMeasure.prototype, {
        /**
         * Gets the label collection of this tool.
         * @memberof LineMeasure.prototype
         * @type {DOMLabelCollection}
         * @readonly
         */
        labelCollection: {
            get: function () {
                return this._labelCollection;
            }
        },

        /**
         * Gets the view interact with.
         * @memberof LineMeasure.prototype
         * @type {DOMLabelCollection}
         * @readonly
         */
        viewer: {
            get: function () {
                return this._viewer;
            }
        },

        /**
         * Gets the status values of this tool, some values about current position, start position, etc.
         * @memberof LineMeasure.prototype
         * @type {Object}
         * @readonly
         */
        status: {
            get: function () {
                return this._status;
            }
        },

        /**
         * Gets array of finishd measure, each object in array contain the line {@link Entity} and {@link DOMLabel}.
         * @memberof LineMeasure.prototype
         * @type {Array}
         * @readonly
         */
        paintedLines: {
            get: function () {
                return this._paintedLines;
            }
        }
    });

    function updateLength(status) {
        status.geodesic.setEndPoints(status.startCartographic, status.endCartographic);
        status.currentLength = status.geodesic.surfaceDistance.toFixed(2);
    }

    function updateMiddle(status) {
        status.geodesic.setEndPoints(status.startCartographic, status.endCartographic);
        status.geodesic.interpolateUsingFraction(0.5, status.scratch);
        status.middleCartesian3 = Cartesian3.fromRadians(status.scratch.longitude, status.scratch.latitude, status.scratch.height);
    }

    function paintLine(tool) {
        tool._currentLine.polyline.positions = [tool._status.startCartesian3, tool._status.endCartesian3];

        var label = tool._labelCollection.add({
            position: tool._status.middleCartesian3,
            text: tool._status.currentLength + ' m',
            className: tool._measureLabelClassName
        });

        tool._paintedLines.push({
            line: tool._currentLine,
            label: label
        });
    }

    function setForStart(tool, pickPosition) {
        var pickPositionCartographic = tool._scene.globe.ellipsoid.cartesianToCartographic(pickPosition);
        tool._status.endCartesian3 = pickPosition;
        tool._status.endCartographic = pickPositionCartographic;
        tool._status.startCartesian3 = pickPosition;
        tool._status.startCartographic = pickPositionCartographic;
        tool._status.isStarted = true;
        tool._drawingLable.show = true;
        tool._drawingLable.position = tool._status.endCartesian3;
        tool._currentLine = tool._viewer.entities.add({
            polyline: {
                positions: [tool._status.startCartesian3, tool._status.endCartesian3],
                width: 5,
                material: Color.MEDIUMTURQUOISE,
            }
        });
        tool._labelCollection.remove(tool._drawingLable);
        tool._labelCollection.add(tool._drawingLable);
    }

    function setForEnd(tool, pickPosition) {
        var pickPositionCartographic = tool._scene.globe.ellipsoid.cartesianToCartographic(pickPosition);
        tool._status.endCartesian3 = pickPosition;
        tool._status.endCartographic = pickPositionCartographic;
        tool._status.isStarted = false;
        tool._drawingLable.show = false;
        updateLength(tool._status);
        updateMiddle(tool._status);
        paintLine(tool);
    }

    function setForMove(tool, pickPosition) {
        tool._status.endCartesian3 = pickPosition;
        tool._status.endCartographic = tool._scene.globe.ellipsoid.cartesianToCartographic(pickPosition);
        updateLength(tool._status);
        tool._drawingLable.text = tool._status.currentLength + ' m';
        tool._drawingLable.position = tool._status.endCartesian3;
    }

    var pickPositionScratch = {};
    var featureScratch = {};

    function getPickPosition(tool, position) {
        if (tool._scene.mode === SceneMode.SCENE3D) {
            featureScratch = tool._scene.pick(position);
            if (featureScratch && featureScratch.id.id !== tool._drawingLine.id && tool._scene.pickPositionSupported) {
                pickPositionScratch = viewer.scene.pickPosition(position);
            } else {
                var pickRay = tool._scene.camera.getPickRay(position);
                pickPositionScratch = tool._scene.globe.pick(pickRay, tool._scene);
            }
            if (pickPositionScratch) {
                return pickPositionScratch;
            }
        }
    }

    function leftClick(tool, movement) {
        var pickPosition = getPickPosition(tool, movement.position);
        if (pickPosition) {
            if (!tool._status.isStarted) {
                setForStart(tool, pickPosition);
            } else {
                setForEnd(tool, pickPosition);
            }
        }
    }

    function mouseMove(tool, movement) {
        if (tool._status.isStarted) {
            var pickPosition = getPickPosition(tool, movement.endPosition);
            if (pickPosition) {
                setForMove(tool, pickPosition);
            }
        }
    }

    /**
     * Start measuring, mouse left button down pick two points in the view,
     * then draw the line and distance label between them.
     */
    LineMeasure.prototype.startDraw = function () {
        if (!this._drawHandler.isDestroyed()) {
            this._drawHandler.destroy();
        }
        this._drawHandler = new ScreenSpaceEventHandler(this._viewer.canvas);
        var that = this;
        this._drawHandler.setInputAction(function (movement) {
            leftClick(that, movement);
        }, ScreenSpaceEventType.LEFT_CLICK);
        this._drawHandler.setInputAction(function (movement) {
            mouseMove(that, movement);
        }, ScreenSpaceEventType.MOUSE_MOVE);
    };

    /**
     * Stop measuring, get out from measure state, keep the measure history(lines and labels).
     */
    LineMeasure.prototype.endDraw = function () {
        if (!this._drawHandler.isDestroyed()) {
            this._drawHandler.destroy();
            this._drawingLable.show = false;
            this._status.isStarted = false;
        }
    };

    return LineMeasure;
});
