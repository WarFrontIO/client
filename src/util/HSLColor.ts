import {RGBColor} from "./RGBColor";

/**
 * Color in the HSLA format.
 */
export class HSLColor {
	readonly h: number;
	readonly s: number;
	readonly l: number;
	readonly a: number;

	constructor(h: number, s: number, l: number, a: number = 1) {
		this.h = h;
		this.s = s;
		this.l = l;
		this.a = a;
	}

	/**
	 * @returns A string representation of the color in the HSLA format.
	 */
	toString(): string {
		return `hsla(${this.h}, ${this.s * 100}%, ${this.l * 100}%, ${this.a})`;
	}

	/**
	 * Convert the color to an RGB color.
	 * @returns The color in the RGB format.
	 */
	toRGB(): RGBColor {
		return new RGBColor(this.toRGBComponent(0), this.toRGBComponent(8), this.toRGBComponent(4), this.a);
	}

	/**
	 * @param h The hue value to set.
	 * @returns A new color with the hue value set.
	 */
	withHue(h: number): HSLColor {
		return new HSLColor((h % 360 + 360) % 360, this.s, this.l, this.a);
	}

	/**
	 * @param s The saturation value to set.
	 * @returns A new color with the saturation value set.
	 */
	withSaturation(s: number): HSLColor {
		return new HSLColor(this.h, Math.min(Math.max(s, 0), 1), this.l, this.a);
	}

	/**
	 * @param l The lightness value to set.
	 * @returns A new color with the lightness value set.
	 */
	withLightness(l: number): HSLColor {
		return new HSLColor(this.h, this.s, Math.min(Math.max(l, 0), 1), this.a);
	}

	/**
	 * @param a The alpha value to set.
	 * @returns A new color with the alpha value set.
	 */
	withAlpha(a: number): HSLColor {
		return new HSLColor(this.h, this.s, this.l, Math.min(Math.max(a, 0), 1));
	}

	/**
	 * Create a color from an RGB value.
	 * @param r The red value.
	 * @param g The green value.
	 * @param b The blue value.
	 */
	static fromRGB(r: number, g: number, b: number): HSLColor {
		r /= 255;
		g /= 255;
		b /= 255;
		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		const diff = max - min;
		const divisor = 1 - Math.abs(min + max - 1);
		let hue = 0;
		if (diff !== 0) {
			switch (max) {
				case r:
					hue = (g - b) / diff % 6;
					break;
				case g:
					hue = (b - r) / diff + 2;
					break;
				case b:
					hue = (r - g) / diff + 4;
					break;
			}
			hue = 60 * (hue < 0 ? hue + 6 : hue);
		}
		return new HSLColor(hue, divisor === 0 ? 0 : diff / divisor, (max + min) / 2);
	}

	/**
	 * Approximates the RGB value of the color.
	 * @param component The component to approximate, 0 for red, 8 for green, 4 for blue.
	 * @private
	 */
	private toRGBComponent(component: number) {
		const k = (component + this.h / 30) % 12;
		const a = this.s * Math.min(this.l, 1 - this.l);
		return Math.round(255 * (this.l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))));
	}

	/**
	 * Create a color from an RGBA value.
	 * @param r The red value.
	 * @param g The green value.
	 * @param b The blue value.
	 * @param a The alpha value.
	 */
	static fromRGBA(r: number, g: number, b: number, a: number): HSLColor {
		return HSLColor.fromRGB(r, g, b).withAlpha(a);
	}

	/**
	 * Create a color from an RGB color.
	 * @param color The color to convert.
	 */
	static fromRGBColor(color: RGBColor): HSLColor {
		return HSLColor.fromRGB(color.r, color.g, color.b).withAlpha(color.a);
	}
}