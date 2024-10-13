/**
 * An array that keeps its elements sorted by a priority value.
 */
export class PriorityList<T> implements Iterable<T> {
	private readonly elements: T[] = [];
	private readonly values: number[] = [];

	/**
	 * Adds an element to the array.
	 * Duplicate priorities will appear in the reverse order they were added.
	 * @param element The element to add
	 * @param priority The value to order the element by
	 */
	add(element: T, priority: number) {
		const index = this.values.findIndex(value => value <= priority);
		if (index === -1) {
			this.elements.push(element);
			this.values.push(priority);
		} else {
			this.elements.splice(index, 0, element);
			this.values.splice(index, 0, priority);
		}
	}

	/**
	 * Removes an element from the array.
	 * @param element The element to remove
	 */
	remove(element: T) {
		const index = this.elements.indexOf(element);
		if (index !== -1) {
			this.elements.splice(index, 1);
			this.values.splice(index, 1);
		}
	}

	find(predicate: (value: T, index: number, obj: T[]) => unknown): T | undefined {
		return this.elements.find(predicate);
	}

	[Symbol.iterator](): Iterator<T> {
		return this.elements[Symbol.iterator]();
	}
}