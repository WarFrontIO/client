#version 300 es

in uint pos;
in uint id;
uniform uint width;
uniform float scale;
uniform vec2 offset;
uniform vec2 size;
flat out uint texture_pos;

void main() {
    gl_Position = vec4((((size * (vec2(int(pos) % int(width), int(pos) / int(width)) + .5) + offset) * 2.) - 1.) * vec2(1, -1), 0, 1);
    gl_PointSize = scale;
    texture_pos = id;
}