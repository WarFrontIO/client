#version 300 es

in mediump vec2 pos;
in mediump vec2 char;
in lowp float blur;
uniform mediump vec2 offset;
uniform mediump vec2 size;
out mediump vec2 texture_pos;
out lowp float texture_blur;

void main() {
    gl_Position = vec4(((size * pos + offset) * 2. - 1.) * vec2(1, -1), 0, 1);
    texture_pos = char;
    texture_blur = blur;
}