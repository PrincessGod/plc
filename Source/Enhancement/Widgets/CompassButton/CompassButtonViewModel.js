define([
    '../../../Core/defined',
    '../../../Core/defineProperties',
    '../../../Core/DeveloperError',
    '../../../ThirdParty/knockout',
    '../../../Widgets/createCommand',
    '../../../Core/destroyObject',
    '../../../Scene/SceneMode'
], function(
    defined,
    defineProperties,
    DeveloperError,
    knockout,
    createCommand,
    destroyObject,
    SceneMode) {
    'use strict';

    /**
     * The view model for {@link CompassButton}
     * @alias CompassButtonViewModel
     * @constructor
     *
     * @param {Scene} scene The scene instance to use.
     * @param {Number} [duration] The duration of the camera flight in seconds.
     */
    function CompassButtonViewModel(scene, duration) {
        //>>includeStart('debug', pragmas.debug);
        if (!defined(scene)) {
            throw new DeveloperError('scene is required.');
        }
        //>>includeEnd('debug');

        var currentHeading = 0;
        this._scene = scene;
        this._duration = duration;

        var that = this;
        this._command = createCommand(function() {
            if (that._scene.mode === SceneMode.SCENE3D) {
                that._scene.camera.flyTo({
                    destination: that._scene.camera.position,
                    duration: that._duration,
                    orientation: {
                        heading: 0,
                        pitch: that._scene.camera.pitch,
                        roll: that._scene.camera.roll
                    }
                });
            }
        });


        this._scene.camera.percentageChanged = 0.01;
        this._getHeadingListener = function() {
            currentHeading = that._scene.camera.heading % (Math.PI * 2) * -1;
            currentHeading = (currentHeading / Math.PI * 180).toFixed(0);
            that._headingStyle = 'rotate(' + currentHeading + 'deg)';
            return currentHeading;
        };
        this._scene.camera.changed.addEventListener(this._getHeadingListener);
        this._scene.camera.moveEnd.addEventListener(this._getHeadingListener);
        this._headingStyle = "rotate(0deg)";

        /**
         * Gets or sets the tooltip.  This property is observable.
         *
         * @type {String}
         */
        this.tooltip = '指南针';

        knockout.track(this, ['tooltip', '_headingStyle']);
    }

    defineProperties(CompassButtonViewModel.prototype, {
        /**
         * Gets the scene to control.
         * @memberof CompassButton.prototype
         * @type {Scene}
         * @readonly
         */
        scene: {
            get: function() {
                return this._scene;
            }
        },

        /**
         * Gets the Command that is executed when the button is clicked.
         * @memberof CompassButtonViewModel.prototype
         * @type {Command}
         * @readonly
         */
        command: {
            get: function() {
                return this._command;
            }
        },

        /**
         * Gets or sets the duration of the camera flight in seconds.
         * A value of zero causes the camera to instantly switch to north direction.
         * The duration will be computed based on the distance when undefined.
         * @memberof CompassButtonViewModel.prototype
         * @type {Number|undefined}
         */
        duration: {
            get: function() {
                this._duration = value;
            },
            set: function(value) {
                //>>includeStart('debug', pragmas.debug);
                if (defined(value) && value < 0) {
                    throw new DeveloperError('value must be positive.');
                }
                //>>includeEnd('debug');

                this._duration = value;
            }
        },

        /**
         * Gets current north direction with the camera heading in radians
         * @memberof CompassButtonViewModel.prototype
         * @type {Number}
         * @readonly
         */
        headingStyle: {
            get: function() {
                return this._headingStyle;
            }
        }
    });

    /**
     * @returns {Boolean} true if the object has been destroyed, false otherwise.
     */
    CompassButtonViewModel.prototype.isDestroyed = function() {
        return false;
    };

    /**
     * Destorys the viewmodel.  Should be called if permanently
     * removing the viewmodel and widget.
     */
    CompassButtonViewModel.prototype.destroy = function() {
        this._scene.camera.changed.removeEventListener(this._getHeadingListener);
        this._scene.camera.moveEnd.removeEventListener(this._getHeadingListener);
        this._scene.camera.percentageChanged = 0.1;
        destroyObject(this);
    };

    return CompassButtonViewModel;
});