#version 300 es

in mediump uint pos;
in highp uint id;
uniform mediump ivec2 size;
flat out highp uint texture_pos;

void main() {
    gl_Position = vec4((((vec2(int(pos) % size.x, int(pos) / size.x) + .5) / vec2(size) * 2.) - 1.), 0, 1);
    gl_PointSize = 1.;
    texture_pos = id;
}