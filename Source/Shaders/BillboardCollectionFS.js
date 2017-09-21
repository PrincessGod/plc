//This file is automatically rebuilt by the Cesium build process.
define(function() {
    'use strict';
    return "uniform sampler2D u_atlas;\n\
varying vec2 v_textureCoordinates;\n\
#ifdef RENDER_FOR_PICK\n\
varying vec4 v_pickColor;\n\
#else\n\
varying vec4 v_color;\n\
#endif\n\
void main()\n\
{\n\
#ifdef RENDER_FOR_PICK\n\
vec4 vertexColor = vec4(1.0, 1.0, 1.0, 1.0);\n\
#else\n\
vec4 vertexColor = v_color;\n\
#endif\n\
vec4 color = texture2D(u_atlas, v_textureCoordinates) * vertexColor;\n\
#if defined(RENDER_FOR_PICK) || (!defined(OPAQUE) && !defined(TRANSLUCENT))\n\
if (color.a < 0.005)\n\
{\n\
discard;\n\
}\n\
#else\n\
#ifdef OPAQUE\n\
if (color.a < 0.995)\n\
{\n\
discard;\n\
}\n\
#else\n\
if (color.a >= 0.995)\n\
{\n\
discard;\n\
}\n\
#endif\n\
#endif\n\
#ifdef RENDER_FOR_PICK\n\
gl_FragColor = v_pickColor;\n\
#else\n\
gl_FragColor = color;\n\
#endif\n\
}\n\
";
});