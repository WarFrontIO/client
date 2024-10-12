import {beforeEach, describe, test} from "node:test";
import {CookieContext} from "../../src/util/CookieContext";
import {equal} from "node:assert";

describe("CookieContext", () => {
	let cookieValue: string;
	Object.defineProperty(global, "document", {
		value: {
			get cookie() { return cookieValue; },
			set cookie(value: string) {
				const [name] = value.split('=');
				const cookies = cookieValue.split('; ').filter(cookie => !cookie.startsWith(name));
				cookies.push(value);
				cookieValue = cookies.join('; ');
			}
		}
	});

	beforeEach(() => {
		cookieValue = "cookie1=value1; cookie2=value2";
	});

	test("should get the cookie value", () => {
		equal((new CookieContext("cookie1")).get(), "value1");
		equal((new CookieContext("cookie2")).get(), "value2");
	});

	test("should ignore set calls if the value hasn't been fetched", () => {
		const context = new CookieContext("cookie1");
		equal(context.set("value3", 1), false);
		equal(context.get(), "value1");
	});

	test("should set the cookie value", () => {
		const context = new CookieContext("cookie1");
		context.get(); // Fetch the value
		equal(context.set("value3", 1), true);
		equal(context.get(), "value3");
	});

	test("should allow force setting the cookie value", (t) => {
		const context = new CookieContext("cookie1");
		equal(context.get(), "value1");
		context.forceSet("value4", 1);
		equal(context.get(), "value4");
	});

	test("should block setting the cookie value if it has changed", () => {
		const context = new CookieContext("cookie1");
		context.get(); // Fetch the value
		cookieValue = "cookie1=value2; cookie2=value2"; // Change the value
		equal(context.set("value3", 1), false);
		equal(context.get(), "value2");
	});

	test("should include the SameSite and Secure attributes", t => {
		t.mock.method(Date, "now", () => 1000);

		const context = new CookieContext("cookie1");
		context.get(); // Fetch the value
		context.set("value3", 7);
		equal(cookieValue, "cookie2=value2; cookie1=value3; expires=Thu, 08 Jan 1970 00:00:01 GMT; path=/; SameSite=Strict; Secure");
	});
});