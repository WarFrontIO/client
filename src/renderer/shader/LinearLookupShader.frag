#version 300 es

flat in mediump uint texture_pos;
uniform lowp sampler2D palette_data;
uniform mediump uint length;
out lowp vec4 outColor;

void main() {
    outColor = texture(palette_data, vec2(float(texture_pos) / float(length), .5));
}