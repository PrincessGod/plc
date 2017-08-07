/*global require*/
// require in the complete Cesium object and reassign it globally.
// This is meant for use with the Almond loader.
require([
    './Plc/plc'
], function(
    plc) {
    'use strict';
    /*global self*/
    var scope = typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : {};
    scope.Cesium = plc;
    scope.CESIUM_BASE_URL = './Build/Cesium';

    //>>includeStart('combinePath', pragmas.combinePath);
    scope.CESIUM_BASE_URL = '../Build/CesiumUnminified';
    //>>includeEnd('combinePath');

}, undefined, true);