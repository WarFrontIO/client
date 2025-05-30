#version 300 es

in mediump vec2 pos;
in lowp vec4 color;
uniform mediump vec2 offset;
uniform mediump vec2 size;
out lowp vec4 inColor;

void main() {
    gl_Position = vec4(((size * pos + offset) * 2. - 1.) * vec2(1, -1), 0, 1);
    inColor = color;
}