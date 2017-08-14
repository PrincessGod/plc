define([
    '../../Core/Cartesian3',
    '../../Core/createGuid',
    '../../Core/defaultValue',
    '../../Core/defined',
    '../../Core/DeveloperError',
    '../../Core/Check',
    '../../Core/defineProperties',
], function(
    Cartesian3,
    createGuid,
    defaultValue,
    defined,
    DeveloperError,
    Check,
    defineProperties) {
    'use strict';

    /**
     * DOMLabel instance generate dom div element and manipulate it.
     * They can added to {@link DOMLabelCollection} to display and manage.
     * @alias DOMLabel
     * @constructor
     *
     * @param {Object} options Object with the following properties:
     * @param {Object} [options.id] A unique identifier for this object. If none is provided, a GUID is generated.
     * @param {String} [options.name] A human readable name to display to users. It does not have to be unique.
     * @param {String} [options.className="plc-dom-label"] The className property for DOM element of this object.
     * @param {Cartesian3} options.position The label position, pin in the 3d scene.
     * @param {Boolean} [options.show=true] A boolean value indicating if the label show or not.
     * @param {String} [options.text] A string property to show in label.
     *
     * @demo {@link http://princessgod.com/plc/label|Label Demo}
     */
    function DOMLabel(options) {
        //>>includeStart('debug', pragmas.debug);
        if (!defined(options)) {
            throw new DeveloperError('options is required.');
        }
        if (!defined(options.position)) {
            throw new DeveloperError('options.position is required');
        }
        if (!(options.position instanceof Cartesian3)) {
            throw new DeveloperError('options.position have to be a Cartesian3 object');
        }
        //>>includeEnd('debug');

        var id = options.id;
        if (!defined(id)) {
            id = createGuid();
        }

        this._id = id;
        this._name = options.name;
        this._className = defaultValue(options.className, 'plc-dom-label');
        this._show = defaultValue(options.show, true);
        this._text = defaultValue(options.text, '');
        this._domlabelCollection = undefined;
        this._label = createDOMLabel(options, this);
        this._position = options.position;
    }

    function createDOMLabel(options, domLabel) {
        var label = document.createElement('div');
        label.className = domLabel._className;
        label.style.position = 'absolute';
        label.style.display = domLabel._show ? 'block' : 'none';
        label.innerHTML = options.text;
        return label;
    }

    defineProperties(DOMLabel.prototype, {
        /**
         * Gets the unique ID associated with this object.
         * @memberof DOMLabel.prototype
         * @readonly
         * @type {Object}
         */
        id: {
            get: function() {
                return this._id;
            }
        },

        /**
         * Gets or sets the name of the object, The name is intended for end-user
         * consumption and does not need to be unique.
         * @memberof DOMLabel.prototype
         * @type {String}
         */
        name: {
            get: function() {
                return this._name;
            },
            set: function(value) {
                //>>includeStart('debug', pragmas.debug);
                Check.typeOf.string('name', value);
                //>>includeEnd('debug');

                this._name = value;
            }
        },

        /**
         * Gets or sets the className property of {@link DOMLabel#label} element,
         * default value is "plc-dom-label".
         * @memberof DOMLabel.prototype
         * @type {String}
         */
        className: {
            get: function() {
                return this._className;
            },
            set: function(value) {
                //>>includeStart('debug', pragmas.debug);
                Check.typeOf.string('className', value);
                //>>includeEnd('debug');

                this._className = value;
                if (defined(this._label)) {
                    this._label.className = this._className;
                }
            }
        },
        /**
         * Gets or sets whether this label should be displayed.  When set to true,
         * the label is only displayed if parent entity's show property is also true.
         * @memberof DOMLabel.prototype
         * @type {Boolean}
         */
        show: {
            get: function() {
                return this._show;
            },
            set: function(value) {
                //>>includeStart('debug', pragmas.debug);
                if (!defined(value)) {
                    throw new DeveloperError('value is required.');
                }
                //>>includeEnd('debug');

                if (value === this._show) {
                    return;
                }

                this._label.style.display = value ? 'block' : 'none';
                this._show = value;
            }
        },

        /**
         * Gets or sets the text for this label. Batter not mix html tags in it.
         * @memberof DOMLabel.prototype
         * @type {String}
         */
        text: {
            get: function() {
                return this._text;
            },
            set: function(value) {
                //>>includeStart('debug', pragmas.debug);
                Check.typeOf.string('text', value);
                //>>includeEnd('debug');

                this._text = value;
                this._label.innerHTML = value;
            }
        },

        /**
         * Get the html element of this label.
         * @memberof DOMLabel.prototype
         * @readonly
         * @type {Element}
         */
        label: {
            get: function() {
                return this._label;
            }
        },

        /**
         * Gets the {@link DOMLabelCollection} of this label, return undefined when not have.
         * @memberof DOMLabel.prototype
         * @readonly
         * @type {DOMLabelCollection}
         */
        domlabelCollection: {
            get: function() {
                return this._domlabelCollection;
            }
        },

        /**
         * Gets or sets position in the world of this label.
         * @memberof DOMLabel.prototype
         * @type {Cartesian3}
         */
        position: {
            get: function() {
                return this._position;
            },
            set: function(value) {
                //>>includeStart('debug', pragmas.debug);
                if (!defined(value)) {
                    throw new DeveloperError('value is required.');
                }
                if (!(value instanceof Cartesian3)) {
                    throw new DeveloperError('options.position have to be a Cartesian3 object');
                }
                //>>includeEnd('debug');

                this._position = value;
            }
        }
    });

    return DOMLabel;
});
