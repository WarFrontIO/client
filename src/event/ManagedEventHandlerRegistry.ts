import {EventHandlerRegistry} from "./EventHandlerRegistry";

/**
 * Simple event handler registry for managing event listeners.
 * Mainly used to manage game event listeners.
 */
export class ManagedEventHandlerRegistry<T extends unknown[]> extends EventHandlerRegistry<T> {
	/**
	 * Creates a new event handler registry.
	 * @param callImmediately If true, the handleListener method is called for each listener immediately after registration.
	 * @param handleListener The method to call on each listener.
	 */
	constructor(
		private readonly callImmediately: boolean = false,
		private readonly handleListener: (listener: (this: void, ...args: T) => void) => void
	) {
		super();
	}

	/**
	 * Registers a listener to receive events.
	 * If callImmediately is true, the listener is called immediately after registration (e.g. for initialization).
	 * Note: you most likely have to bind the listener to the correct context or specify "this: void" in the listener.
	 * @param listener The listener to register.
	 */
	register(listener: (this: void, ...args: T) => void) {
		if (this.callImmediately) {
			this.handleListener(listener);
		}
		super.register(listener);
	}

	/**
	 * Broadcasts an event to all registered listeners.
	 * @internal Only call this method if you are the event source.
	 */
	broadcast() {
		this.listeners.forEach(this.handleListener);
	}
}