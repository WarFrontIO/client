#version 300 es

precision highp float;

in vec2 texture_pos;
uniform sampler2D dist_data;
uniform int min;
uniform int max;
uniform float gradient;
uniform vec4 color;
out vec4 outColor;

void main() {
    vec4 data = texture(dist_data, texture_pos);
    int dist = (int(data.r * 31. * 2048. + data.g * 63. * 32. + data.b * 31. + .5) ^ 0x8000) - 32768;
    if (dist >= min && dist < max) {
        outColor = vec4(color.rgb, color.a * gradient * float(dist - min) + (gradient > 0. ? 0. : 1.));
    } else discard;
}