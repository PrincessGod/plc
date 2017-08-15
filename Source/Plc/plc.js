define([
    'Cesium',
    '../Enhancement/Widgets/CompassButton/CompassButton',
    '../Enhancement/Widgets/CompassButton/CompassButtonViewModel',
    '../Enhancement/Scene/TiandituVecImageryProvider',
    '../Enhancement/Scene/TiandituTextImageryProvider',
    '../Enhancement/DataSources/DOMLabel',
    '../Enhancement/DataSources/DOMLabelCollection',
    '../Enhancement/Measurements/LineMeasure'
], function(
    Cesium,
    CompassButton,
    CompassButtonViewModel,
    TiandituVecImageryProvider,
    TiandituTextImageryProvider,
    DOMLabel,
    DOMLabelCollection,
    LineMeasure) {
    'use strict';
    //>>includeStart('debug', pragmas.debug);
    console.log('%c Almond Debug ' + '%cOn ', 'background: #222; color: #bada55', 'background: #222;color: #3a3');
    //>>includeEnd('debug');

    //>>includeStart('debug', !pragmas.debug);
    console.log('%c Almond Debug ' + '%cOff ', 'background: #222; color: #bada55', 'background: #222;color: #a33');
    //>>includeEnd('debug');

    //>>includeStart('combinePath', pragmas.combinePath);
    console.log('%c Using ' + '%cCombine Path ', 'background: #222; color: #bada55', 'background: #222;color: #3a3');
    //>>includeEnd('combinePath');

    //>>includeStart('combinePath', !pragmas.combinePath);
    console.log('%c Using ' + '%cRelease Path ', 'background: #222; color: #bada55', 'background: #222;color: #3a3');
    //>>includeEnd('combinePath');

    var plc = {};
    plc['CompassButton'] = CompassButton;
    plc['CompassButtonViewModel'] = CompassButtonViewModel;
    plc['TiandituVecImageryProvider'] = TiandituVecImageryProvider;
    plc['TiandituTextImageryProvider'] = TiandituTextImageryProvider;
    plc['DOMLabel'] = DOMLabel;
    plc['DOMLabelCollection'] = DOMLabelCollection;
    plc['LineMeasure'] = LineMeasure;
    Cesium.PLC = plc;
    return Cesium;
});