#version 300 es

precision highp float;

in vec2 texture_pos;
uniform sampler2D texture_data;
uniform sampler2D palette_data;
out vec4 outColor;

void main() {
    vec4 id = texture(texture_data, texture_pos);
    outColor = texture(palette_data, vec2((id.g * 63. * 32. + id.b * 31. + .5) / 2048., (id.r * 31. + .5) / 32.));
}