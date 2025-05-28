#version 300 es

in mediump vec2 texture_pos;
uniform mediump usampler2D texture_data;
uniform lowp sampler2D palette_data;
out lowp vec4 outColor;

void main() {
    mediump int id = int(texture(texture_data, texture_pos).r);
    outColor = texelFetch(palette_data, ivec2(id % 256, id / 256), 0);
}