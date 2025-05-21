#version 300 es
in vec2 pos;
out vec2 texture_pos;

void main() {
    gl_Position = vec4(((pos * 2.) - 1.), 0, 1);
    texture_pos = pos;
}