define([
    '../../Core/defined',
    '../../Core/defineProperties',
    '../../Core/DeveloperError',
    '../../ThirdParty/knockout',
    '../../Widgets/createCommand',
    '../../Core/destroyObject',
    '../../Scene/SceneMode'
], function(
    defined,
    defineProperties,
    DeveloperError,
    knockout,
    createCommand,
    destroyObject,
    SceneMode) {
    'use strict';

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

        this._headingStyle = "rotate(0deg)";

        this.tooltip = '指南针';

        knockout.track(this, ['tooltip', '_headingStyle']);
    }

    defineProperties(CompassButtonViewModel.prototype, {
        scene: {
            get: function() {
                return this._scene;
            }
        },

        command: {
            get: function() {
                return this._command;
            }
        },

        duration: {
            get: function() {
                //>>includeStart('debug', pragmas.debug);
                if (defined(value) && value < 0) {
                    throw new DeveloperError('value must be positive.');
                }
                //>>includeEnd('debug');

                this._duration = value;
            }
        },

        headingStyle: {
            get: function() {
                return this._headingStyle;
            }
        }
    });

    CompassButtonViewModel.prototype.isDestroyed = function() {
        return false;
    };

    CompassButtonViewModel.prototype.destroy = function() {
        this._scene.camera.changed.removeEventListener(this._getHeadingListener);
        destroyObject(this);
    };

    return CompassButtonViewModel;
});