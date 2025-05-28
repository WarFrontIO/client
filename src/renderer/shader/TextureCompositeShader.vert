#version 300 es

in mediump vec2 pos;
uniform mediump float scale;
uniform mediump vec2 offset;
uniform mediump vec2 size;
out vec2 texture_pos;

void main() {
    gl_Position = vec4(((size * pos + offset) * 2. - 1.) * vec2(1, -1), 0, 1);
    texture_pos = pos;
}