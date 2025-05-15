export class SortedArray<T> {
	private readonly array: T[] = [];
	private readonly priority: number[] = [];

	/**
	 * Add an item to the array.
	 * @param item The item to add
	 * @param priority The priority of the item
	 */
	add(item: T, priority: number): void {
		const index = this.priority.findIndex(i => i > priority);
		if (index === -1) {
			this.array.push(item);
			this.priority.push(priority);
		} else {
			this.array.splice(index, 0, item);
			this.priority.splice(index, 0, priority);
		}
	}

	/**
	 * Clear the array.
	 */
	clear() {
		this.array.length = 0;
		this.priority.length = 0;
	}

	/**
	 * Iterate over the array.
	 * @param callback The callback to call for each item
	 */
	forEach(callback: (value: T, index: number, array: T[]) => void): void {
		this.array.forEach(callback);
	}
}