#version 300 es

in highp uint pos;
in mediump uint id;
uniform mediump uint width;
uniform mediump float scale;
uniform mediump vec2 offset;
uniform mediump vec2 size;
flat out mediump uint texture_pos;

void main() {
    gl_Position = vec4((((size * (vec2(int(pos) % int(width), int(pos) / int(width)) + .5) + offset) * 2.) - 1.) * vec2(1, -1), 0, 1);
    gl_PointSize = scale;
    texture_pos = id;
}