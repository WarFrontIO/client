import {EventHandlerRegistry} from "./EventHandlerRegistry";
import {StripUnknownParams} from "../util/UnsafeTypes";

export class CachedEventHandlerRegistry<T extends unknown[]> extends EventHandlerRegistry<T> {
	private cache: T[] = [];

	/**
	 * Broadcast an event to all listeners.
	 * The event will be cached and sent to future listeners.
	 * @param args The arguments to broadcast
	 * @internal Only call this method if you are the event source
	 */
	broadcast(...args: StripUnknownParams<T>): void {
		super.broadcast(...args);
		this.cache.push(args);
	}

	/**
	 * Register a listener for this event.
	 * The listener will be called with all cached events.
	 * @param listener The listener to register
	 */
	register(listener: (this: void, ...args: T) => void) {
		super.register(listener);
		for (const args of this.cache) {
			listener(...args);
		}
	}
}