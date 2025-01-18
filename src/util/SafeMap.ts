export class SafeMap<K, V> extends Map<K, V> {
	private readonly defaultValue: () => V;

	constructor(defaultValue: () => V) {
		super();
		this.defaultValue = defaultValue;
	}

	/**
	 * Get the value for the given key.
	 * If the key is not present in the map, it will be added with an empty array.
	 * @param key The key to get the value for.
	 */
	getOrSet(key: K): V {
		const value = this.get(key);
		if (value) return value;

		const newValue: V = this.defaultValue();
		this.set(key, newValue);
		return newValue;
	}
}