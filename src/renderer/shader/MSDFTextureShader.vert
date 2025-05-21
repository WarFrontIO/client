#version 300 es

in vec2 pos;
in vec2 char;
in float blur;
uniform vec2 offset;
uniform vec2 size;
out vec2 texture_pos;
out float texture_blur;

void main() {
    gl_Position = vec4(((size * pos + offset) * 2. - 1.) * vec2(1, -1), 0, 1);
    texture_pos = char;
    texture_blur = blur;
}