#version 300 es

in mediump vec2 texture_pos;
uniform lowp sampler2D texture_data;
out lowp vec4 outColor;

void main() {
    outColor = texture(texture_data, texture_pos);
}