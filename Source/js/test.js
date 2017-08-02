define(['Cesium'], function(Cesium) {
    'use strict';
    /*global self*/
    var scope = typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : {};
    
    scope.Cesium = Cesium;
    
    console.log(Cesium);
    return Cesium;
});