#version 300 es

flat in highp uint texture_pos;
uniform lowp sampler2D palette_data;
out lowp vec4 outColor;

void main() {
    outColor = texelFetch(palette_data, ivec2(int(texture_pos) % 256, int(texture_pos) / 256), 0);
}