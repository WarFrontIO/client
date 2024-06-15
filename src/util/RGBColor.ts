import {HSLColor} from "./HSLColor";

/**
 * Color in the RGBA format.
 */
export class RGBColor {
	readonly r: number;
	readonly g: number;
	readonly b: number;
	readonly a: number;

	constructor(r: number, g: number, b: number, a: number = 1) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}

	/**
	 * @returns A string representation of the color in the HSLA format.
	 */
	toString(): string {
		return `(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
	}

	/**
	 * Write the color as a rgba value to a buffer.
	 * @param buffer The buffer to write to.
	 * @param offset The offset to write to.
	 */
	writeToBuffer(buffer: Uint8Array | Uint8ClampedArray, offset: number): void {
		buffer[offset] = this.r;
		buffer[offset + 1] = this.g;
		buffer[offset + 2] = this.b;
		buffer[offset + 3] = this.a * 255 | 0
	}

	/**
	 * Blend the color with a buffer.
	 * The alpha channel is used for blending and not modified.
	 * @param buffer The buffer to blend with.
	 * @param offset The offset to blend with.
	 * @param strength The strength of the blend, 0 for no change, 1 for full change.
	 */
	blendWithBuffer(buffer: Uint8Array | Uint8ClampedArray, offset: number, strength: number = 1): void {
		buffer[offset] = strength * this.a * this.r + (1 - strength * this.a) * buffer[offset];
		buffer[offset + 1] = strength * this.a * this.g + (1 - strength * this.a) * buffer[offset + 1];
		buffer[offset + 2] = strength * this.a * this.b + (1 - strength * this.a) * buffer[offset + 2];
	}

	/**
	 * @param r The red value to set.
	 * @returns A new color with the red value set.
	 */
	withRed(r: number): RGBColor {
		return new RGBColor(Math.min(Math.max(r, 0, 255)), this.g, this.b, this.a);
	}

	/**
	 * @param g The green value to set.
	 * @returns A new color with the green value set.
	 */
	withGreen(g: number): RGBColor {
		return new RGBColor(this.r, Math.min(Math.max(g, 0, 255)), this.b, this.a);
	}

	/**
	 * @param b The blue value to set.
	 * @returns A new color with the blue value set.
	 */
	withBlue(b: number): RGBColor {
		return new RGBColor(this.r, this.g, Math.min(Math.max(b, 0, 255), this.b, this.a));
	}

	/**
	 * @param a The alpha value to set.
	 * @returns A new color with the alpha value set.
	 */
	withAlpha(a: number): HSLColor {
		return new HSLColor(this.r, this.g, this.b, Math.min(Math.max(a, 0), 1));
	}
}