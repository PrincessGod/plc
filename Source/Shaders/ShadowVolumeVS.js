//This file is automatically rebuilt by the Cesium build process.
define(function() {
    'use strict';
    return "attribute vec3 position3DHigh;\n\
attribute vec3 position3DLow;\n\
attribute vec4 color;\n\
attribute float batchId;\n\
#ifdef EXTRUDED_GEOMETRY\n\
attribute vec3 extrudeDirection;\n\
uniform float u_globeMinimumAltitude;\n\
#endif\n\
varying float v_WindowZ;\n\
varying vec4 v_color;\n\
vec4 depthClampFarPlane(vec4 vertexInClipCoordinates)\n\
{\n\
v_WindowZ = (0.5 * (vertexInClipCoordinates.z / vertexInClipCoordinates.w) + 0.5) * vertexInClipCoordinates.w;\n\
vertexInClipCoordinates.z = min(vertexInClipCoordinates.z, vertexInClipCoordinates.w);\n\
return vertexInClipCoordinates;\n\
}\n\
void main()\n\
{\n\
v_color = color;\n\
vec4 position = czm_computePosition();\n\
#ifdef EXTRUDED_GEOMETRY\n\
float delta = min(u_globeMinimumAltitude, czm_geometricToleranceOverMeter * length(position.xyz));\n\
delta *= czm_sceneMode == czm_sceneMode3D ? 1.0 : 0.0;\n\
position = position + vec4(extrudeDirection * delta, 0.0);\n\
#endif\n\
gl_Position = depthClampFarPlane(czm_modelViewProjectionRelativeToEye * position);\n\
}\n\
";
});