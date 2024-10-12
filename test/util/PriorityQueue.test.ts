import {describe, test, beforeEach} from "node:test";
import {equal} from "node:assert";
import {PriorityQueue} from "../../src/util/PriorityQueue";

describe("PriorityQueue", () => {
	let queue: PriorityQueue<number>;

	beforeEach(() => {
		queue = new PriorityQueue((a, b) => a < b);
		queue.push(4);
		queue.push(1);
		queue.push(5);
		queue.push(3);
		queue.push(2);
	});

	test("push", async t => {
		await t.test("should increase the size of the queue", () => {
			equal(queue.size(), 5);
			queue.push(6);
			equal(queue.size(), 6);
		});

		await t.test("should return the new size of the queue", () => {
			equal(queue.push(6), 6);
		});
	});

	test("pop", async t => {
		await t.test("should decrease the size of the queue", () => {
			equal(queue.size(), 5);
			queue.pop();
			equal(queue.size(), 4);
		});

		await t.test("should return the value at the front of the queue", () => {
			equal(queue.pop(), 1);
			equal(queue.pop(), 2);
			equal(queue.pop(), 3);
			equal(queue.pop(), 4);
			equal(queue.pop(), 5);
		});
	});

	test("update", async t => {
		await t.test("should increase the priority of an element", () => {
			queue.update(e => e === 2, 6);
			equal(queue.pop(), 1);
			equal(queue.pop(), 3);
			equal(queue.pop(), 4);
			equal(queue.pop(), 5);
			equal(queue.pop(), 6);
			equal(queue.size(), 0);
		});

		await t.test("should do nothing if the value is not in the queue", () => {
			queue.update(e => e === 6, 10);
			equal(queue.pop(), 1);
			equal(queue.pop(), 2);
			equal(queue.pop(), 3);
			equal(queue.pop(), 4);
			equal(queue.pop(), 5);
		});
	});

	test("isEmpty", () => {
		equal(queue.isEmpty(), false);
		queue.pop();
		queue.pop();
		queue.pop();
		queue.pop();
		queue.pop();
		equal(queue.isEmpty(), true);
	})
});