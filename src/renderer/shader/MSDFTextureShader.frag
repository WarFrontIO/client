#version 300 es

in mediump vec2 texture_pos;
in lowp float texture_blur;
uniform lowp sampler2D texture_data;
out lowp vec4 outColor;

void main() {
    lowp vec4 data = texture(texture_data, texture_pos);
    lowp float median = max(min(data.r, data.g), min(max(data.r, data.g), data.b));
    lowp float opacity = smoothstep(min(.28, .3 - texture_blur * .3), max(.32, .3 + texture_blur * .25), median);
    outColor = vec4(0, 0, 0, opacity);
}