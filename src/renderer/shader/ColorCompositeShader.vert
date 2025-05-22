#version 300 es

in vec2 pos;
in vec4 color;
uniform vec2 offset;
uniform vec2 size;
out vec4 inColor;

void main() {
    gl_Position = vec4(((size * pos + offset) * 2. - 1.) * vec2(1, -1), 0, 1);
    inColor = color;
}