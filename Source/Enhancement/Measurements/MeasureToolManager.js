define([
    './LineMeasure',
    './PolylineMeasure',
    './PolygonMeasure',
    '../../Core/defined',
    '../../Core/Check',
    '../../Core/defineProperties',
    '../../Core/DeveloperError',
    './MeasureMode'
], function (
    LineMeasure,
    PolylineMeasure,
    PolygonMeasure,
    defined,
    Check,
    defineProperties,
    DeveloperError,
    MeasureMode) {
    'use strict';

    /**
     * A tool manager that is containted line measure, polyline measure, polygon measure.
     * Manage and manipulate with different tools whit it help become handy.
     * 
     * @alias MeasureToolManager
     * @constructor
     * 
     * @param {Object} options Object with the following properties：
     * @param {Viewer} [options.viewer] The viewer instance will used for each tool's constructor. If tool options specify a new viewer, then use that viewer for the tool.
     * If this value is difinded, will always use this value initialize three tools, otherwise will only initialize the tool which has an options parameter.
     * So for it, options.viewer, options.line, options.polyline, options.polygon should be assigned at least one of them.
     * @param {Object} [options.line] The line measure tool's option parameters, look detial {@link LineMeasure}.
     * @param {Object} [options.polyline] The polyline measure tool's option parameters, look detial {@link PolylineMeasure}.
     * @param {Object} [options.polygon] The polygon measure tool's option parameters, look detial {@link PolygonMeasure}.
     * 
     * @demo {@link http://princessgod.com/plc/lineMeasurement|Line Measurement Demo}
     * 
     * @exception {DeveloperError} options at least have to have one of options.viewer, options.line, options.polyline, options.polygon.
     * 
     * @see LineMeasure
     * @see PolylineMeasure
     * @see PolygonMeasure
     * 
     */
    function MeasureToolManger(options) {
        //>>includeStart('debug', pragmas.debug);
        if (!defined(options)) {
            throw new DeveloperError('options is required.');
        }
        if (!defined(options.viewer) && !defined(options.line) && !defined(options.polyline) && !defined(options.polygon)) {
            throw new DeveloperError('options at least have to have one of options.viewer, options.line, options.polyline, options.polygon');
        }
        //>>includeEnd('debug');

        if (defined(options.line)) {
            if (!defined(options.line.viewer) && defined(options.viewer)) {
                options.line.viewer = options.viewer;
            }
            this._lineTool = new LineMeasure(options.line);
        } else if (defined(options.viewer)) {
            this._lineTool = new LineMeasure({
                viewer: options.viewer
            });
        }

        if (defined(options.polyline)) {
            if (!defined(options.polyline.viewer) && defined(options.viewer)) {
                options.polyline.viewer = options.viewer;
            }
            this._polylineTool = new PolylineMeasure(options.polyline);
        } else if (defined(options.viewer)) {
            this._polylineTool = new PolylineMeasure({
                viewer: options.viewer
            });
        }

        if (defined(options.polygon)) {
            if (!defined(options.polygon.viewer) && defined(options.viewer)) {
                options.polygon.viewer = options.viewer;
            }
            this._polygonTool = new PolygonMeasure(options.polygon);
        } else if (defined(options.viewer)) {
            this._polygonTool = new PolygonMeasure({
                viewer: options.viewer
            });
        }

        this._mode = MeasureMode.NONE;
        this._currentTool = undefined;
    }

    defineProperties(MeasureToolManger.prototype, {
        /**
         * Gets line measure tool, if options.viewer and options.line are both undefinded in constructor, it will be undefinded.
         * 
         * @memberof MeasureToolManager.prototype
         * @type {LineMeasure}
         * @readonly
         */
        lineTool: {
            get: function () {
                return this._lineTool;
            }
        },

        /**
         * Gets polyline measure tool, if options.viewer and options.polyline are both undefinded in constructor, it will be undefinded.
         * 
         * @memberof MeasureToolManager.prototype
         * @type {PolylineMeasure}
         * @readonly
         */
        polylineTool: {
            get: function () {
                return this._polylineTool;
            }
        },

        /**
         * Gets polygon measure tool, if options.viewer and options.polygon are both undefinded in constructor, it will be undefinded.
         * 
         * @memberof MeasureToolManager.prototype
         * @type {PolygonMeasure}
         * @readonly
         */
        polygonTool: {
            get: function () {
                return this._polygonTool;
            }
        },

        /**
         * Gets current tool mode, indicate which tool is binding now.
         * 
         * @memberof MeasureToolManager.prototype
         * @type {MeasureMode}
         * @readonly
         */
        mode: {
            get: function () {
                return this._mode;
            }
        },

        /**
         * Gets or sets current tool, gets could be one of tools or undfinded, Sets also can use {@link MeasureTool}.
         * 
         * @memberof MeasureToolManager.prototype
         * @type {Object}
         * 
         * @exception {DeveloperError} Select an undefinded tool.
         */
        currentTool: {
            get: function () {
                return this._currentTool;
            },
            set: function (value) {
                switch (value) {
                    case undefined:
                        this._mode = MeasureMode.NONE;
                        this._currentTool = undefined;
                        return;
                    case this._lineTool:
                        this._mode = MeasureMode.LINE;
                        this._currentTool = this._lineTool;
                        return;
                    case this._polylineTool:
                        this._mode = MeasureMode.POLYLINE;
                        this._currentTool = this._polylineTool;
                        return;
                    case this._polygonTool:
                        this._mode = MeasureMode.POLYGON;
                        this._currentTool = this._polygonTool;
                        return;
                    case MeasureMode.NONE:
                        this._mode = MeasureMode.NONE;
                        this._currentTool = undefined;
                        return;
                    case MeasureMode.LINE:
                        //>>includeStart('debug', pragmas.debug);
                        if (!defined(this._lineTool)) {
                            throw new DeveloperError('Select an undefinded tool.');
                        }
                        //>>includeEnd('debug');
                        this._mode = MeasureMode.LINE;
                        this._currentTool = this._lineTool;
                        return;
                    case MeasureMode.POLYLINE:
                        //>>includeStart('debug', pragmas.debug);
                        if (!defined(this._polylineTool)) {
                            throw new DeveloperError('Select an undefinded tool.');
                        }
                        //>>includeEnd('debug');
                        this._mode = MeasureMode.POLYLINE;
                        this._currentTool = this._polylineTool;
                        return;
                    case MeasureMode.POLYGON:
                        //>>includeStart('debug', pragmas.debug);
                        if (!defined(this._polygonTool)) {
                            throw new DeveloperError('Select an undefinded tool.');
                        }
                        //>>includeEnd('debug');
                        this._mode = MeasureMode.POLYGON;
                        this._currentTool = this._polygonTool;
                        return;
                    default:
                        this._mode = MeasureMode.NONE;
                        this._currentTool = undefined;
                        return;
                }
            }
        },
    });

    /**
     * Using current binding tool call startDraw() to begin drawing.
     * 
     * @param {MeasureMode|Object} [tool=this.currentTool] MeasureMode or measure tool object indecate the tool want to switch to.
     * @exception {DeveloperError} currentTool is undefinded, make sure tool is banding before call startDraw()
     * 
     * @example
     * 
     * // Create a tool manager
     * var toolManager = new Cesium.PLC.MeasureToolManager({viewer: viewer});
     * 
     * // Switch to line measure tool
     * toolManager.currentTool = Cesium.PLC.MeasureMode.LINE;
     * 
     * // Start drawing
     * toolManager.startDraw();
     * 
     * // Switch to polyline line tool and start drawing
     * toolManager.startDraw(Cesium.PIC.MeasureMode.POLYLINE);
     * 
     */
    MeasureToolManger.prototype.startDraw = function (tool) {
        if (defined(tool)) {
            if (!(this._currentTool === tool || this._mode === tool)) {
                if (defined(this._currentTool)) {
                    this._currentTool.endDraw();
                }
                this.currentTool = tool;
            }
        }

        //>>includeStarted('debug', pragmas.debug);
        if (!defined(this._currentTool)) {
            throw new DeveloperError('currentTool is undefinded, make sure tool is banding before call startDraw()');
        }

        this.currentTool.startDraw();
    };

    /**
     * Stop current tool's drawing and clear painted entities and labels for this tool if clearHistory is false.
     * In face it calls current tool's endDraw() and clearHistory() if clearHistor is true.
     * 
     * @param {Boolean} [clearHistory=false] If true, clear the current tool's painted entities and labels, false otherwise.
     * @exception {DeveloperError} currentTool is undefinded, make sure tool is banding before call endDraw().
     * 
     * @example
     * 
     * // Create a tool manager
     * var toolManager = new Cesium.PLC.MeasureToolManager({viewer: viewer});
     * 
     * // Switch to polyline line tool and start drawing
     * toolManager.startDraw(Cesium.PIC.MeasureMode.POLYLINE);
     * 
     * // End drawing and keep the polyline tool history
     * toolManager.endDraw()
     * 
     * // Call endDraw() to clear polyline tool history
     * toolManager.endDraw(true)
     */
    MeasureToolManger.prototype.endDraw = function (clearHistory) {
        //>>includeStart('debug', pragmas.debug);
        Check.typeOf.bool('keepTool', clearHistory);
        //>>includeEnd('debug');

        //>>includeStarted('debug', pragmas.debug);
        if (!defined(this._currentTool)) {
            throw new DeveloperError('currentTool is undefinded, make sure tool is banding before call endDraw()');
        }

        this._currentTool.endDraw();

        if (clearHistory === true) {
            this._currentTool.clearHistory();
        }
    };

    /**
     * Clear all painted entities and labels by tools.
     */
    MeasureToolManger.prototype.clearAllHistory = function () {
        if (this._lineTool instanceof LineMeasure) {
            this._lineTool.clearHistory();
        }
        if (this._polylineTool instanceof PolylineMeasure) {
            this._polylineTool.clearHistory();
        }
        if (this._polygonTool instanceof PolygonMeasure) {
            this._polygonTool.clearHistory();
        }
    };

    return MeasureToolManger;
});