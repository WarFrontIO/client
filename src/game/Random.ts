class Random {
	seed: number;

	reset(seed: number): void {
		this.seed = seed;
	}

	next(): number {
		// SplitMix32 algorithm
		this.seed |= 0;
		this.seed = this.seed + 0x9e3779b9 | 0;
		let t = this.seed ^ this.seed >>> 16;
		t = Math.imul(t, 0x21f0aaad);
		t = t ^ t >>> 15;
		t = Math.imul(t, 0x735a2d97);
		return ((t ^ t >>> 15) >>> 0) / 4294967296;
	}

	nextInt(max: number): number {
		return Math.floor(this.next() * max);
	}
}

export const random = new Random();