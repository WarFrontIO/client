#version 300 es

in mediump vec2 texture_pos;
uniform mediump isampler2D dist_data;
uniform mediump int min;
uniform mediump int max;
uniform mediump float gradient;
uniform lowp vec4 color;
out lowp vec4 outColor;

void main() {
    mediump int dist = texture(dist_data, texture_pos).r;
    if (dist >= min && dist < max) {
        outColor = vec4(color.rgb, color.a * gradient * float(dist - min) + (gradient > 0. ? 0. : 1.));
    } else discard;
}