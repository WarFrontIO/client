#version 300 es

precision highp float;

in vec2 texture_pos;
in float texture_blur;
uniform sampler2D texture_data;
out vec4 outColor;

void main() {
    vec4 data = texture(texture_data, texture_pos);
    float median = max(min(data.r, data.g), min(max(data.r, data.g), data.b));
    float opacity = smoothstep(min(.28, .3 - texture_blur * 0.3), max(.32, .3 + texture_blur * 0.25), median);
    outColor = vec4(0, 0, 0, opacity);
}