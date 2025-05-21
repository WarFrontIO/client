#version 300 es

in vec2 pos;
uniform float scale;
uniform vec2 offset;
uniform vec2 size;
out vec2 texture_pos;

void main() {
    gl_Position = vec4(((scale * pos / size + offset) * 2. - 1.) * vec2(1, -1), 0, 1);
    texture_pos = pos;
}