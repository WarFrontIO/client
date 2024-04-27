/**
 * A simple pseudo-random number generator.
 * This uses the SplitMix32 algorithm to generate random 32-bit integers.
 *
 * ONLY USE THIS FOR DETERMINISTIC RANDOMNESS OF GAMEPLAY ELEMENTS.
 * NEVER USE THIS FOR CLIENT-SIDE LOGIC OR RENDERING.
 */
class Random {
	seed: number;

	/**
	 * Creates a new Random instance with a random seed.
	 * @param seed seed for the random number generator
	 * @internal
	 */
	reset(seed: number): void {
		this.seed = seed;
	}

	/**
	 * Generate a random number and advances the internal state.
	 * @see Random
	 * @returns a random number between 0 and 1
	 */
	next(): number {
		this.seed |= 0;
		this.seed = this.seed + 0x9e3779b9 | 0;
		let t = this.seed ^ this.seed >>> 16;
		t = Math.imul(t, 0x21f0aaad);
		t = t ^ t >>> 15;
		t = Math.imul(t, 0x735a2d97);
		return ((t ^ t >>> 15) >>> 0) / 4294967296;
	}

	/**
	 * Generate a random integer between 0 and max.
	 * @param max the maximum value (exclusive)
	 * @returns a random integer between 0 and max
	 */
	nextInt(max: number): number {
		return Math.floor(this.next() * max);
	}
}

export const random = new Random();