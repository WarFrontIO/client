#version 300 es

precision highp float;

in vec2 texture_pos;
uniform sampler2D texture_data;
out vec4 outColor;

void main() {
    outColor = texture(texture_data, texture_pos);
}