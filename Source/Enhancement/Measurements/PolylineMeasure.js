define([
    '../../Core/DeveloperError',
    '../../Core/defineProperties',
    '../../Core/Check',
    '../../Core/defined',
    '../../Core/Cartesian3',
    '../../Core/Cartographic',
    '../../Core/EllipsoidGeodesic',
    '../../DataSources/CallbackProperty',
    '../../Core/Color',
    '../../Core/defaultValue',
    '../../Core/ScreenSpaceEventHandler',
    '../../Core/ScreenSpaceEventType',
    '../../Scene/SceneMode',
], function (
    DeveloperError,
    defineProperties,
    Check,
    defined,
    Cartesian3,
    Cartographic,
    EllipsoidGeodesic,
    CallbackProperty,
    Color,
    defaultValue,
    ScreenSpaceEventHandler,
    ScreenSpaceEventType,
    SceneMode) {
    'use strict';

    /**
     * A tool can measure polyline's length, draw line and length label after finshed.
     * 
     * @alias PolylineMeasure
     * @constructor
     * 
     * @param {Object} options Object with the following prperties:
     * @param {Viewer} options.viewer The viewer instance to use.
     * @param {DOMLabelCollection} [options.labelCollection=options.viewer.domLabels] The label collection to contain {@link DOMLabel} with length information.
     * @param {Number} [options.geoDistanceCameraHeight=400000.0] A height property, if current camera's height less than the value, length will ignore ellipsoid effect, more than otherwise.
     * @param {Boolean} [options.showFragLength=false] True will show length between adjacent two points, false otherwise.
     * @param {String} [options.drawinglabelClassName="plc-line-mesaure-drawing-label"] The clasName property of the {@link DOMLabel} which will move with mouse and show in drawing.
     * @param {String} [options.measureLabelClassName="plc-line-measure-label"] The calssName property of the {@link DOMLabel} which will show at last point with total length after drawing.
     * @param {string} [options.measureLabelCalssName="plc-polyline-measure-middle-label"] The className property of the {@link DOMLabel} which will show if the {@link PolylineMeasure#showFragLength} property is true.
     *      
     * @demo {@link http://princessgod.com/plc/lineMeasurement|Line Measurement Demo}
     * 
     * @see DOMLabel
     * @see DOMLabelCollection
     */
    function PolylineMeasure(options) {
        //>>includeStart('debug', pragmas.debug);
        Check.defined('options', options);
        Check.defined('options.viewer', options);
        if (!defined(options.labelCollection) && !defined(options.viewer.domLabels)) {
            throw new DeveloperError('options.labelCollection is required');
        }
        //>>includeEnd('debug');


        this._viewer = options.viewer;
        this._scene = options.viewer.scene;
        this._labelCollection = defined(options.labelCollection) ? options.labelCollection : options.viewer.domLabels;
        this._paintedPolylines = [];
        this._geoDistanceCameraHeight = defaultValue(options.geoDistanceCameraHeight, 400000.0);
        this._drawHandler = new ScreenSpaceEventHandler(this._viewer.canvas);
        this._showFragLength = defaultValue(options.showFragLength, false);
        this._drawingLabelClassName = defaultValue(options.drawingLabelClassName, 'plc-line-mesaure-drawing-label');
        this._measureLabelClassName = defaultValue(options.measureLabelClassName, 'plc-line-measure-label');
        this._measureLabelMClassName = defaultValue(options.measureLabelMClassName, 'plc-polyline-measure-middle-label');

        var status = {
            isStarted: false,
            pointsCartesian3: [],
            startCartesian3: new Cartesian3(),
            endCartesian3: new Cartesian3(),
            startCartographic: new Cartographic(),
            endCartographic: new Cartographic(),
            geodesic: new EllipsoidGeodesic(),
            currentLength: 0,
            totalLength: 0,
            lastLabels: []
        };
        this._status = status;

        var that = this;
        this._drawingPolyline = viewer.entities.add({
            polyline: {
                positions: new CallbackProperty(function () {
                    if (that._status.isStarted) {
                        return that._status.pointsCartesian3.concat(that._status.endCartesian3);
                    }
                }, false),
                width: 5,
                material: Color.HOTPINK
            }
        });
        this._drawingLabel = this._labelCollection.add({
            position: new Cartesian3(),
            text: '0 m',
            vOffset: -15,
            show: false,
            className: this._drawingLabelClassName
        });
        this._currentPolyline = undefined;
    }

    defineProperties(PolylineMeasure.prototype, {
        /**
         * Gets a label collection instance, contains all length labels.
         * 
         * @memberof PolylineMeasure.prototype
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
         * Gets the viewer instance which is using with.
         * 
         * @memberof PolylineMeasure.prototype
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
         * Gets status infomations about this tool.
         * 
         * @memberof PolylineMeasure.prototype
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
         * Gets an array contains objects with line and label property, which are painted lines and labels.
         * 
         * @memberof PolylineMeasure.prototype
         * 
         * @type {Array}
         * @readonly
         */
        paintedPolylines: {
            get: function () {
                return this._paintedPolylines;
            }
        },

        /**
         * Gets or set wheather show each line segment's length or not.
         * 
         * @memberof PolylineMeasure.prototype
         * 
         * @type {Boolean}
         */
        showFragLength: {
            get: function () {
                return this._showFragLength;
            },
            set: function (value) {
                //>>includeStart('debug', pragmas.debug);
                Check.typeOf.bool('showFragLength', value);
                //>>includeEnd('debug');

                this._showFragLength = value;
            }
        }
    });

    var scratch = {};

    function getLengthString(length) {
        if (length < 1) {
            return (length * 100).toFixed(2) + ' cm';
        }
        if (length < 1000) {
            return length.toFixed(2) + ' m';
        }
        return (length / 1000).toFixed(2) + ' km';
    }

    function getMiddlePoint(geodesic, startCartographic, endCartographic) {
        geodesic.setEndPoints(startCartographic, endCartographic);
        geodesic.interpolateUsingFraction(0.5, scratch);
        return Cartesian3.fromRadians(scratch.longitude, scratch.latitude, (startCartographic.height + endCartographic.height) / 2);
    }

    function updateCurrentLength(tool) {
        scratch = Cartographic.fromCartesian(tool._viewer.camera.positionWC);
        if (scratch && scratch.height < tool._geoDistanceCameraHeight) {
            tool._status.currentLength = Cartesian3.distance(tool._status.startCartesian3, tool._status.endCartesian3);
        } else {
            tool._status.geodesic.setEndPoints(tool._status.startCartographic, tool._status.endCartographic);
            tool._status.currentLength = tool._status.geodesic.surfaceDistance;
        }
    }

    function updateTotalLength(tool) {
        updateCurrentLength(tool);
        if (tool._showFragLength) {
            var lengthLabel = tool._labelCollection.add({
                position: getMiddlePoint(tool._status.geodesic, tool._status.startCartographic, tool._status.endCartographic),
                text: getLengthString(tool._status.currentLength),
                className: tool._measureLabelMClassName
            });

            var lineLabelObj = {
                label: lengthLabel
            };

            tool._paintedPolylines.push(lineLabelObj);
            tool._status.lastLabels.push(lineLabelObj);
        }
        tool._status.totalLength += tool._status.currentLength;
    }

    function paintPolyline(tool) {
        tool._currentPolyline.polyline.positions = tool._status.pointsCartesian3;

        var lengthLabel = tool._labelCollection.add({
            position: tool._status.pointsCartesian3[tool._status.pointsCartesian3.length - 1],
            text: getLengthString(tool._status.totalLength),
            className: tool._measureLabelClassName
        });

        tool._paintedPolylines.push({
            line: tool._currentPolyline,
            label: lengthLabel
        });
    }

    function resetStatus(tool) {
        tool._status.startCartesian3 = new Cartesian3();
        tool._status.endCartesian3 = new Cartesian3();
        tool._status.startCartographic = new Cartographic();
        tool._status.endCartographic = new Cartographic();
        tool._status.pointsCartesian3 = [];
        tool._status.currentLength = 0;
        tool._status.totalLength = 0;
        tool._status.isStarted = false;
        tool._drawingLabel.show = false;
        tool._status.lastLabels = [];
    }

    function setForStart(tool, pickPosition) {
        var pickPositionCartographic = tool._scene.globe.ellipsoid.cartesianToCartographic(pickPosition);
        tool._status.startCartesian3 = pickPosition;
        tool._status.endCartesian3 = pickPosition;
        tool._status.startCartographic = pickPositionCartographic;
        tool._status.endCartographic = pickPositionCartographic;
        tool._status.pointsCartesian3.push(pickPosition);
        tool._status.isStarted = true;
        tool._drawingLabel.show = true;
        tool._drawingLabel.position = tool._status.endCartesian3;
        tool._currentPolyline = tool._viewer.entities.add({
            polyline: {
                positions: [tool._status.startCartesian3, tool._status.endCartesian3],
                width: 5,
                material: Color.MEDIUMTURQUOISE
            }
        });
        tool._labelCollection.remove(tool._drawingLabel);
        tool._labelCollection.add(tool._drawingLabel);
    }

    function setForAddPoint(tool, pickPosition) {
        var pickPositionCartographic = tool._scene.globe.ellipsoid.cartesianToCartographic(pickPosition);
        tool._status.endCartesian3 = pickPosition;
        tool._status.endCartographic = pickPositionCartographic;
        updateTotalLength(tool);
        tool._status.startCartesian3 = pickPosition;
        tool._status.startCartographic = pickPositionCartographic;
        tool._status.pointsCartesian3.push(pickPosition);
    }

    function setForEnd(tool) {
        if (tool._status.pointsCartesian3.length > 1) {
            paintPolyline(tool);
        } else {
            tool._viewer.entities.remove(tool._currentPolyline);
        }
        resetStatus(tool);
    }

    function setForMove(tool, pickPosition) {
        tool._status.endCartesian3 = pickPosition;
        tool._status.endCartographic = tool._scene.globe.ellipsoid.cartesianToCartographic(pickPosition);
        updateCurrentLength(tool);
        tool._drawingLabel.text = getLengthString(tool._status.currentLength);
        tool._drawingLabel.position = tool._status.endCartesian3;
    }

    var featureScratch = {};
    var pickPositionScratch = {};
    var pickRayScratch = {};

    function getPickPosition(tool, windowPosition) {
        if (tool._scene.mode === SceneMode.SCENE3D) {
            featureScratch = tool._scene.pick(windowPosition);
            if (featureScratch && tool._scene.pickPositionSupported) {
                pickPositionScratch = tool._scene.pickPosition(windowPosition);
                if (!pickPositionScratch || Cartographic.fromCartesian(pickPositionScratch).height < 0) {
                    pickRayScratch = tool._scene.camera.getPickRay(windowPosition);
                    pickPositionScratch = tool._scene.globe.pick(pickRayScratch, tool._scene);
                }
            } else {
                pickRayScratch = tool._scene.camera.getPickRay(windowPosition);
                pickPositionScratch = tool._scene.globe.pick(pickRayScratch, tool._scene);
            }
            if (pickPositionScratch) {
                return pickPositionScratch;
            }
        }
    }

    function leftClick(tool, movement) {
        pickPositionScratch = getPickPosition(tool, movement.position);
        if (pickPositionScratch) {
            if (!tool._status.isStarted) {
                setForStart(tool, pickPositionScratch);
            } else {
                setForAddPoint(tool, pickPositionScratch);
            }
        }
    }

    function rightClick(tool) {
        if (tool._status.isStarted) {
            setForEnd(tool);
        }
    }

    function mouseMove(tool, movement) {
        if (tool._status.isStarted) {
            pickPositionScratch = getPickPosition(tool, movement.endPosition);
            if (pickPositionScratch) {
                setForMove(tool, pickPositionScratch);
            }
        }
    }

    /**
     * Start measurement, mouse left click pick points, mouse right click finish current polyline,
     * and show total length at last pick point. If {@link PolylineMeasure#showFragLength} is true,
     * will show line segment length at middle position after each point picked.
     */
    PolylineMeasure.prototype.startDraw = function () {
        if (!this._drawHandler.isDestroyed()) {
            this._drawHandler.destroy();
        }
        this._drawHandler = new ScreenSpaceEventHandler(this._viewer.canvas);

        var that = this;
        this._drawHandler.setInputAction(function (movement) {
            leftClick(that, movement);
        }, ScreenSpaceEventType.LEFT_CLICK);
        this._drawHandler.setInputAction(function () {
            rightClick(that);
        }, ScreenSpaceEventType.RIGHT_CLICK);
        this._drawHandler.setInputAction(function (movement) {
            mouseMove(that, movement);
        }, ScreenSpaceEventType.MOUSE_MOVE);
    };

    /**
     * Terminate measurement, if current measurement not finished, cancel polyline and all points in it. 
     */
    PolylineMeasure.prototype.endDraw = function () {
        if (!this._drawHandler.isDestroyed()) {
            this._drawHandler.destroy();

            for (var index = 0; index < this._status.lastLabels.length; index++) {
                var idx = this._paintedPolylines.indexOf(this._status.lastLabels[index]);
                if (idx > -1) {
                    this._paintedPolylines.splice(idx, 1);
                }
                this._labelCollection.remove(this._status.lastLabels[index].label);
            }

            resetStatus(this);
        }
    };

    return PolylineMeasure;
});
