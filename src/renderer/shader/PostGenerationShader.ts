/**
 * Simple shader for the map or related layers.
 * This shader is only applied once after the map has been loaded.
 */
export interface PostGenerationShader {
	/**
	 * Apply the shader to the loaded map
	 */
	apply(pixels: Uint8ClampedArray): void;
}