#version 300 es

precision highp float;

flat in uint texture_pos;
uniform sampler2D palette_data;
uniform uint length;
out vec4 outColor;

void main() {
    outColor = texture(palette_data, vec2(float(texture_pos) / float(length), .5));
}