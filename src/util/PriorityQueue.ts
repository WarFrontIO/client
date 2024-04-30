/**
 * Priority queue implementation using a binary heap.
 */
export class PriorityQueue<T> {
	private readonly heap: T[] = [];

	/**
	 * Create a new priority queue.
	 * @param comparator Comparator function to compare the priority of two values.
	 */
	constructor(private readonly comparator: (a: T, b: T) => boolean) {
	}

	/**
	 * Check if the queue is empty.
	 * @returns Whether the queue is empty.
	 */
	isEmpty(): boolean {
		return this.size() === 0;
	}

	/**
	 * Get the size of the queue.
	 * @returns The size of the queue.
	 */
	size(): number {
		return this.heap.length;
	}

	/**
	 * Get the value at the front of the queue.
	 * @returns The value at the front of the queue.
	 */
	peek(): T {
		return this.heap[0];
	}

	/**
	 * Push a value into the queue.
	 * @param value The value to push.
	 * @returns The new size of the queue.
	 */
	push(value: T): number {
		this.siftUp(value);
		return this.size();
	}

	/**
	 * Pop the value at the front of the queue.
	 * @returns The value at the front of the queue.
	 */
	pop(): T {
		if (this.size() === 1) {
			return this.heap.pop();
		}

		const value = this.heap[0];
		this.siftDown(this.heap.pop());
		return value;
	}

	/**
	 * Sift up a node in the heap.
	 * @param node The node to sift up.
	 * @private
	 */
	private siftUp(node: T) {
		let index = this.size();
		while (index > 0) {
			const parentIndex = ((index + 1) >>> 1) - 1;
			if (!this.comparator(node, this.heap[parentIndex])) {
				break;
			}
			this.heap[index] = this.heap[parentIndex];
			index = parentIndex;
		}
		this.heap[index] = node;
	}

	/**
	 * Sift down a node in the heap.
	 * @param node The node to sift down.
	 * @private
	 */
	private siftDown(node: T) {
		let index = 0;
		let maxParent = this.size() >>> 1;
		while (index < maxParent) {
			const leftIndex = (index << 1) + 1;
			const rightIndex = leftIndex + 1;

			const leftValue = this.heap[leftIndex];
			const rightValue = this.heap[rightIndex];
			if (rightIndex < this.size() && this.comparator(rightValue, leftValue)) {
				if (this.comparator(rightValue, node)) {
					this.heap[index] = rightValue;
					index = rightIndex;
				} else {
					break;
				}
			} else {
				if (this.comparator(leftValue, node)) {
					this.heap[index] = leftValue;
					index = leftIndex;
				} else {
					break;
				}
			}
		}
		this.heap[index] = node;
	}
}