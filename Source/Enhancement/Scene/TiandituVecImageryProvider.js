define([
    '../../Scene/WebMapTileServiceImageryProvider',
    '../../Core/defaultValue',
    '../../Core/GeographicTilingScheme',
    '../../Core/Credit',
    '../../Core/defineProperties',
    '../../Core/destroyObject',
    '../../Core/defined'
], function(
    WebMapTileServiceImageryProvider,
    defaultValue,
    GeographicTilingScheme,
    Credit,
    defineProperties,
    destroyObject,
    defined) {
    'use strict';

    /**
     * Provides tiled street imagery hosted by Tianditu MapServer.
     * Create a default {@link WebMapTileServiceImageryProvider} for {@link http://www.tianditu.com/service/query.html|Tianditu MapServer}.
     *
     * @alias TiandituVecImageryProvider
     * @constructor
     *
     * @param {Object} [options] for {@link WebMapTileServiceImageryProvider} Object with the following default properties:
     * @param {String} [options.url='http://t0.tianditu.com/vec_c/wmts?'] The base URL for the WMTS GetTile operation (add "SERVICE=WMTS&REQUEST=GetCapabilities" to check "getTile" interface).
     * @param {String} [options.layer='vec'] The layer name for WMTS requests.
     * @param {String} [options.style='default'] The style name for WMTS requests.
     * @param {String} [options.format='tiles'] The MIME type for images to retrieve from the server.
     * @param {String} [options.tileMatrixSetID='c'] The identifier of the TileMatrixSet to use for WMTS requests.
     * @param {TilingScheme} [options.tilingScheme=new GeographicTilingScheme()] The tiling scheme corresponding to the organization of the tiles in the TileMatrixSet.
     * @param {Credit|String} [options.credit=new Credit('Tianditu Vector Layer')] A credit for the data source, which is displayed on the canvas.
     * @param {Number} [options.maximumLevel=17] The maximum level-of-detail supported by the imagery provider, or undefined if there is no limit.
     * @param {Array} [options.tileMatrixLabels=['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19']] A list of identifiers in the TileMatrix to use for WMTS requests, one per TileMatrix level.
     *
     * @demo {@link http://princessgod.com/plc/imageryLayer|ImageryLayers}
     *
     * @example
     * // Add Tianditu layer to viewer
     * var tiandituProvider = new Cesium.PLC.TiandituVecImageryProvider();
     * viewer.imageryLayers.addImageryProvider(tiandituProvider);
     *
     * @see WebMapTileServiceImageryProvider
     */
    function TiandituVecImageryProvider(options) {
        options = defaultValue(options, {});

        options.url = defaultValue(options.url, 'http://t0.tianditu.com/vec_c/wmts?');
        options.layer = defaultValue(options.layer, 'vec');
        options.style = defaultValue(options.style, 'default');
        options.format = defaultValue(options.format, 'tiles');
        options.tileMatrixSetID = defaultValue(options.tileMatrixSetID, 'c');
        options.tilingScheme = defined(options.tilingScheme) ? options.tilingScheme : new GeographicTilingScheme();
        options.credit = defined(options.credit) ? options.credit : new Credit('Tianditu Vector Layer');
        options.maximumLevel = defaultValue(options.maximumLevel, 17);
        options.tileMatrixLabels = defaultValue(options.tileMatrixLabels, ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19']);

        var imageryProvider = new WebMapTileServiceImageryProvider(options);

        this._options = options;
        this._imageryProvider = imageryProvider;
    }

    defineProperties(TiandituVecImageryProvider.prototype, {
        /**
         * Gets the options of TiandituVecImageryProvider
         * @memberof TiandituVecImageryProvider.prototype
         * @type {Object}
         * @readonly
         */
        options: {
            get: function() {
                return this._options;
            }
        },

        /**
         * Gets the {@link WebMapTileServiceImageryProvider} of TiandituVecImageryProvider.
         * @memberof TiandituVecImageryProvider.prototype
         * @type {WebMapTileServiceImageryProvider}
         * @readonly
         */
        imageryProvider: {
            get: function() {
                return this._imageryProvider;
            }
        }
    });

    return TiandituVecImageryProvider;
});
