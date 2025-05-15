#version 300 es

precision highp float;

flat in uint texture_pos;
uniform sampler2D palette_data;
out vec4 outColor;

void main() {
    outColor = texture(palette_data, vec2(float(int(texture_pos) % 256) / 256., float(int(texture_pos) / 256) / 512.));
}