import {describe, test, beforeEach} from "node:test";
import {PriorityList} from "../../src/util/PriorityList";
import {deepEqual, equal} from "node:assert";

describe("PriorityList", () => {
	let array: PriorityList<number>;

	beforeEach(() => {
		array = new PriorityList();
		array.add(5, 5);
		array.add(4, 4);
		array.add(3, 2);
		array.add(2, 1);
		array.add(1, 0);
	});

	test("add", async t => {
		await t.test("should add elements in the correct order", () => {
			deepEqual([...array], [5, 4, 3, 2, 1]);
			array.add(6, -1);
			deepEqual([...array], [5, 4, 3, 2, 1, 6]);
		});

		await t.test("should insert elements at the correct position", () => {
			array.add(6, 3);
			deepEqual([...array], [5, 4, 6, 3, 2, 1]);
		});

		await t.test("should add elements with the same priority in reverse order", () => {
			array.add(6, 4);
			deepEqual([...array], [5, 6, 4, 3, 2, 1]);
			array.add(7, 4);
			deepEqual([...array], [5, 7, 6, 4, 3, 2, 1]);
		});
	});

	test("remove", async t => {
		await t.test("should remove elements from the array", () => {
			array.remove(3);
			deepEqual([...array], [5, 4, 2, 1]);
			array.remove(5);
			deepEqual([...array], [4, 2, 1]);
			array.remove(1);
			deepEqual([...array], [4, 2]);
		});

		await t.test("should do nothing if the element is not in the array", () => {
			array.remove(6);
			deepEqual([...array], [5, 4, 3, 2, 1]);
		});
	});

	test("find", async t => {
		await t.test("should find elements in the array", () => {
			equal(array.find(e => e === 3), 3);
			equal(array.find(e => e === 6), undefined);
		});

		await t.test("should return the first element that matches the predicate", () => {
			equal(array.find(e => e < 4), 3);
		});
	});
});