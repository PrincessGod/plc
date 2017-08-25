define([
    '../../Core/freezeObject'
], function (freezeObject) {
    'use strict';

    /**
     * Indecates the currect meaure tool is none, line measuer, plyline measure or polygon measure.
     * 
     * @exports MeasureMode
     * 
     * @see MeasureToolManager#mode
     */
    var MeasureMode = {
        /**
         * Currect tool is not assigned.
         * 
         * @type {Number}
         * @constant
         */
        NONE: 0,

        /**
         * Currect tool is LineMeasure.
         * 
         * @type {Number}
         * @constant
         */
        LINE: 1,

        /**
         * Currect tool is PolylineMeasure.
         * 
         * @type {Number}
         * @constant
         */
        POLYLINE: 2,

        /**
         * Currect tool is PolygonMeasure.
         * 
         * @type {Number}
         * @constant
         */
        POLYGON: 3
    };

    return freezeObject(MeasureMode);

});