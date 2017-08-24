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
    '../../Core/defaultValue',
    '../../Core/Check',
    '../../Core/Event'
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
    defaultValue,
    Check,
    Event) {
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
     * @param {String} [options.measureLabelVClassName="plc-line-measure-vlabel"] The element className property of the {@link DOMLabel} which will contain the vertical distance result when finsh draw.
     * @param {String} [options.measureLabelHClassName="plc-line-measure-hlabel"] The element className property of the {@link DOMLabel} which will contain the horizontal distance result when finsh draw.
     * @param {Boolean} [options.vhMeasure=false] If true, after drawing will show vertical and horizontal lines, false otherwise.
     * @param {Number} [options.geoDistenceCameraHeight=400000.0] If camera height less than this value, line distance will use the distance beitween two point without consider ellipsoid, 
     * if camera height more than the value then consider ellipsoid.
     * @param {Color} [options.drawingLineColor=Color.HOTPINK] The color of drawing line, whict will show and move with mouse after drawing begin.
     * @param {Color} [options.paintedLineColor=Color.MEDIUMTURQUOISE] The color of painted lines, which will show after drawing.
     * @param {Color} [options.verticalLineColor=Color.YELLOW] The color of vertical distance line, which will show after drawing when options.vhMeasure = true.
     * @param {Color} [options.horizontalLineColor=Color.RED] The color of horizontal distance line, which will show after drawing when options.vhMeasure = true.
     * 
     * @demo {@link http://princessgod.com/plc/lineMeasurement|Line Measurement Demo}
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
        this._scene = this._viewer.scene;
        this._status = status;
        this._paintedLines = [];
        this._drawingLabelClassName = defaultValue(options.drawingLabelClassName, 'plc-line-mesaure-drawing-label');
        this._measureLabelClassName = defaultValue(options.measureLabelClassName, 'plc-line-measure-label');
        this._measureLabelVClassName = defaultValue(options.measureLabelVClassName, 'plc-line-measure-vlabel');
        this._measureLabelHClassName = defaultValue(options.measureLabelHClassName, 'plc-line-measure-hlabel');
        this._drawingLineColor = defined(options.drawingLineColor) ? options.drawingLineColor : Color.HOTPINK;
        this._paintedLineColor = defined(options.paintedLineColor) ? options.paintedLineColor : Color.MEDIUMTURQUOISE;
        this._verticalLineColor = defined(options.verticalLineColor) ? options.verticalLineColor : Color.YELLOW;
        this._horizontalLineColor = defined(options.horizontalLineColor) ? options.horizontalLineColor : Color.RED;

        this._vhMeasure = defaultValue(options.vhMeasure, false);
        this._geoDistanceCameraHeight = defaultValue(options.geoDistenceCameraHeight, 400000.0);

        this._linePainted = new Event();

        var that = this;
        this._drawingLine = this._viewer.entities.add({
            name: 'PLC-LINE-MEASURE-DRAWING-LINE',
            polyline: {
                positions: new CallbackProperty(function () {
                    if (that._status.isStarted) {
                        return [that._status.startCartesian3, that._status.endCartesian3];
                    }
                }, false),
                width: 5,
                material: that._drawingLineColor
            }
        });
        this._drawHandler = new ScreenSpaceEventHandler(this._viewer.canvas);
        this._drawingLable = this._labelCollection.add({
            name: 'PLC-LINE-MEASURE-DRAWING-LABEL',
            position: this._status.endCartesian3,
            text: this._status.currentLength + ' m',
            show: false,
            className: this._drawingLabelClassName,
            vOffset: -15
        });
        this._currentLine = undefined;
    }

    /**
     * The function of the event generated by {@link LineMeasure#linePainted}.
     * 
     * @function
     * @param {Object} addedLine The added line entity and length label, {line: {@link Entity}, label: {@link DOMLabel}}.
     * @param {Object} addedHLine The added horizontal line entity and length label. 
     * If not painted then return undefinded, else returm {line: {@link Entity}, label: {@link DOMLabel}}.
     * @param {Object} addedVLine The added vertical line entity and length label, 
     * If not painted then return undefinded, else returm {line: {@link Entity}, label: {@link DOMLabel}}.
     */
    LineMeasure.linePaintedEventCallback = undefined;

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
         * 
         * @example
         * 
         * // Get the first painted line and label
         * var paintedItem = lineMeasure.paintedLines[0];
         * 
         * // Get the line object
         * var line = paintedItem.line;
         * 
         * // Get the label object
         * var label = paintedItem.label;
         * 
         */
        paintedLines: {
            get: function () {
                return this._paintedLines;
            }
        },

        /**
         * Gets or sets whether the vertical and horizontal measure lines show or not after drawing.
         * @memberof LineMeasure.prototype
         * @type {Boolean}
         * @default false
         */
        vhMeasure: {
            get: function () {
                return this._vhMeasure;
            },
            set: function (value) {
                //>>includeStart('debug', pragmas.debug);
                Check.typeOf.bool('vhMeasure', value);
                //>>includeEnd('debug');

                this._vhMeasure = value;
            }
        },

        /**
         * Gets the ebent that is fired when drawing finished and painted new lines.
         * The generated event is a {@link LineMeasure.linePaintedEventCallback}.
         * @memberof LineMeasure.prototype
         * @type {Event}
         * @readonly
         * 
         * @example
         * 
         * // Get the event
         * var linePaintedEvent = lineMeasure.linePainted;
         * 
         * // Implement the handler
         * function linePaintedHandler(addedLine, addedHLine, addedVLine) {
         *    console.log(addedLine, addedHLine, addedVLine);
         * }
         * 
         * // Add handler to event
         * linePaintedEvent.addEventListener(linePaintedHandler);
         * 
         */
        linePainted: {
            get: function () {
                return this._linePainted;
            }
        }
    });

    function updateLength(tool) {
        tool._status.scratch = Cartographic.fromCartesian(tool._viewer.camera.positionWC);
        if (tool._status.scratch instanceof Cartographic && tool._status.scratch.height < tool._geoDistanceCameraHeight) {
            tool._status.currentLength = Cartesian3.distance(tool._status.startCartesian3, tool._status.endCartesian3);
        } else {
            tool._status.geodesic.setEndPoints(tool._status.startCartographic, tool._status.endCartographic);
            tool._status.currentLength = tool._status.geodesic.surfaceDistance;
        }
    }

    function updateMiddle(status) {
        status.geodesic.setEndPoints(status.startCartographic, status.endCartographic);
        status.geodesic.interpolateUsingFraction(0.5, status.scratch);
        status.middleCartesian3 = Cartesian3.fromRadians(status.scratch.longitude, status.scratch.latitude, (status.startCartographic.height + status.endCartographic.height) / 2);
    }

    function paintVHLines(tool) {
        var status = tool._status;
        var startCartographic = status.startCartographic;
        var endCartographic = status.endCartographic;
        var minHeight = Math.min(startCartographic.height, endCartographic.height);
        var maxHeight = Math.max(startCartographic.height, endCartographic.height);

        var hLow = Cartesian3.fromRadians(startCartographic.longitude, startCartographic.latitude, minHeight);
        var vLow = Cartesian3.fromRadians(endCartographic.longitude, endCartographic.latitude, minHeight);
        var vUp = Cartesian3.fromRadians(endCartographic.longitude, endCartographic.latitude, maxHeight);
        if (endCartographic.height < startCartographic.height) {
            hLow = Cartesian3.fromRadians(endCartographic.longitude, endCartographic.latitude, minHeight);
            vLow = Cartesian3.fromRadians(startCartographic.longitude, startCartographic.latitude, minHeight);
            vUp = Cartesian3.fromRadians(startCartographic.longitude, startCartographic.latitude, maxHeight);
        }

        var hLine = tool._viewer.entities.add({
            name: 'plc-line-measure-painted-h-' + (tool.paintedLines.length - 1),
            polyline: {
                positions: [hLow, vLow],
                width: 5,
                material: tool._horizontalLineColor
            }
        });
        var vLine = tool._viewer.entities.add({
            name: 'plc-line-measure-painted-v-' + (tool.paintedLines.length - 1),
            polyline: {
                positions: [vLow, vUp],
                width: 5,
                material: tool._verticalLineColor
            }
        });

        status.geodesic.setEndPoints(tool._scene.globe.ellipsoid.cartesianToCartographic(hLow), tool._scene.globe.ellipsoid.cartesianToCartographic(vLow));
        var hLength = status.geodesic.surfaceDistance;
        status.geodesic.interpolateUsingFraction(0.5, status.scratch);
        var hMiddle = Cartesian3.fromRadians(status.scratch.longitude, status.scratch.latitude, Math.min(status.startCartographic.height, status.endCartographic.height));

        var vLength = Math.abs(startCartographic.height - endCartographic.height) / 2;
        var vMiddle = Cartesian3.fromRadians(endCartographic.longitude, endCartographic.latitude, (startCartographic.height + endCartographic.height) / 2);
        if (endCartographic.height < startCartographic.height) {
            vMiddle = Cartesian3.fromRadians(startCartographic.longitude, startCartographic.latitude, (startCartographic.height + endCartographic.height) / 2);
        }

        var hLabel = tool._labelCollection.add({
            name: 'plc-line-measure-painted-h-' + (tool.paintedLines.length - 1),
            position: hMiddle,
            text: getLengthString(hLength),
            className: tool._measureLabelHClassName
        });

        var vLabel = tool._labelCollection.add({
            name: 'plc-line-measure-painted-v-' + (tool.paintedLines.length - 1),
            position: vMiddle,
            text: getLengthString(vLength),
            className: tool._measureLabelVClassName
        });

        tool._paintedLines.push({
            line: hLine,
            label: hLabel
        });

        tool._paintedLines.push({
            line: vLine,
            label: vLabel
        });

        var length = tool._paintedLines.length;
        var addedLine = tool._paintedLines[length - 3];
        var addedhLine = tool._paintedLines[length - 2];
        var addedvLine = tool._paintedLines[length - 1];
        tool._linePainted.raiseEvent(addedLine, addedhLine, addedvLine);
    }

    function paintLine(tool) {
        tool._currentLine.polyline.positions = [tool._status.startCartesian3, tool._status.endCartesian3];

        var label = tool._labelCollection.add({
            name: 'plc-line-measure-painted-' + tool.paintedLines.length,
            position: tool._status.middleCartesian3,
            text: getLengthString(tool._status.currentLength),
            className: tool._measureLabelClassName
        });

        tool._paintedLines.push({
            line: tool._currentLine,
            label: label
        });

        if (tool._vhMeasure === true) {
            paintVHLines(tool);
        } else {
            var length = tool._paintedLines.length;
            var addedLine = tool._paintedLines[length - 1];
            tool._linePainted.raiseEvent(addedLine);
        }
    }

    function getLengthString(length) {
        if (length < 1) {
            return (length * 100).toFixed(2) + ' cm';
        }
        if (length < 1000) {
            return length.toFixed(2) + ' m';
        }
        return (length / 1000).toFixed(2) + ' km';
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
            name: 'plc-line-measure-painted-' + tool.paintedLines.length,
            polyline: {
                positions: [tool._status.startCartesian3, tool._status.endCartesian3],
                width: 5,
                material: tool._paintedLineColor
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
        updateLength(tool);
        updateMiddle(tool._status);
        paintLine(tool);
    }

    function setForMove(tool, pickPosition) {
        tool._status.endCartesian3 = pickPosition;
        tool._status.endCartographic = tool._scene.globe.ellipsoid.cartesianToCartographic(pickPosition);
        updateLength(tool);
        tool._drawingLable.text = getLengthString(tool._status.currentLength);
        tool._drawingLable.position = tool._status.endCartesian3;
    }

    function setForCancel(tool) {
        tool._status.isStarted = false;
        tool._drawingLable.show = false;
        tool._viewer.entities.remove(tool._currentLine);
    }

    var pickPositionScratch = {};
    var pickRayScratch = {};
    var featureScratch = {};

    function getPickPosition(tool, position) {
        if (tool._scene.mode === SceneMode.SCENE3D) {
            featureScratch = tool._scene.pick(position);
            if (featureScratch && tool._scene.pickPositionSupported) {
                pickPositionScratch = tool._scene.pickPosition(position);
                if (!pickPositionScratch || Cartographic.fromCartesian(pickPositionScratch).height < 0) {
                    pickRayScratch = tool._scene.camera.getPickRay(position);
                    pickPositionScratch = tool._scene.globe.pick(pickRayScratch, tool._scene);
                }
            } else {
                pickRayScratch = tool._scene.camera.getPickRay(position);
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
                setForEnd(tool, pickPositionScratch);
            }
        }
    }

    function rightClick(tool) {
        if (tool._status.isStarted) {
            setForCancel(tool);
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
        this._drawHandler.setInputAction(function () {
            rightClick(that);
        }, ScreenSpaceEventType.RIGHT_CLICK);
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
