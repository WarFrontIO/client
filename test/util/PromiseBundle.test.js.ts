import {describe, test, mock, beforeEach, Mock} from "node:test";
import {buildPromiseBundle} from "../../src/util/PromiseBundle";
import {equal} from "node:assert";

describe("PromiseBundle", () => {
	function slowMethod(n: number) {
		return new Promise<number>(resolve => setTimeout(() => resolve(n), 1000));
	}

	let mocked: Mock<(n: number) => Promise<number>>;
	let bundle: ((n: number) => Promise<number>) & { isPending: () => boolean };

	beforeEach(() => {
		mocked = mock.fn(slowMethod);
		bundle = buildPromiseBundle(mocked);
	});

	test("should be usable like a normal promise", async t => {
		t.mock.timers.enable();
		equal(mocked.mock.calls.length, 0);
		const promise = bundle(5);
		equal(mocked.mock.calls.length, 1);
		t.mock.timers.tick(1000);
		equal(await promise, 5);
	});

	test("should not call the method again if the promise is still pending", async t => {
		t.mock.timers.enable();
		equal(mocked.mock.calls.length, 0);
		const promise1 = bundle(5);
		const promise2 = bundle(6);
		equal(mocked.mock.calls.length, 1);
		t.mock.timers.tick(1000);
		equal(await promise1, 5);
		equal(await promise2, 5); // The second promise should resolve to the same value
	});

	test("should call the method again if the promise has resolved", async t => {
		t.mock.timers.enable();
		equal(mocked.mock.calls.length, 0);
		const promise1 = bundle(5);
		t.mock.timers.tick(1000);
		equal(await promise1, 5);
		const promise2 = bundle(6);
		equal(mocked.mock.calls.length, 2);
		t.mock.timers.tick(1000);
		equal(await promise2, 6);
	});

	test("should update isPending", async t => {
		t.mock.timers.enable();
		const promise1 = bundle(5);
		equal(bundle.isPending(), true);
		t.mock.timers.tick(1000);
		equal(await promise1, 5);
		equal(bundle.isPending(), false);
		const promise2 = bundle(6);
		equal(bundle.isPending(), true);
		t.mock.timers.tick(1000);
		equal(await promise2, 6);
		equal(bundle.isPending(), false);
	})
});