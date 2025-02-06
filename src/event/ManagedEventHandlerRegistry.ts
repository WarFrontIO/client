import {EventHandlerRegistry} from "./EventHandlerRegistry";

/**
 * Simple event handler registry for managing event listeners.
 * Mainly used to manage game event listeners.
 */
export class AsymmetricEventHandlerRegistry<T extends unknown[], R extends unknown[]> extends EventHandlerRegistry<[...T, ...R]> {
	/**
	 * Creates a new event handler registry.
	 * @param handleListener The method to call on each listener
	 * @param initialHandler The method to call on each listener when it is registered
	 */
	constructor(
		private readonly handleListener: (listener: (this: void, ...args: [...T, ...R]) => void, ...args: T) => void,
		private readonly initialHandler: (listener: (this: void, ...args: [...T, ...R]) => void) => void
	) {
		super();
	}

	/**
	 * Registers a listener to receive events.
	 * The listener is called immediately after registration (e.g. for initialization) using the initialHandler.
	 * Note: you most likely have to bind the listener to the correct context or specify "this: void" in the listener.
	 * @param listener The listener to register.
	 */
	register(listener: (this: void, ...args: [...T, ...R]) => void) {
		this.initialHandler(listener);
		super.register(listener);
	}

	/**
	 * Broadcasts an event to all registered listeners.
	 * @param args The arguments to pass to the listeners.
	 * @internal Only call this method if you are the event source.
	 */
	broadcast<U extends unknown[] = T>(...args: ([...T, ...R] extends [...U, ...R] ? U : never) & T) {
		this.listeners.forEach(listener => this.handleListener(listener, ...args));
	}
}

export class ManagedEventHandlerRegistry<T extends unknown[]> extends AsymmetricEventHandlerRegistry<[], T> {
	constructor(handleListener: (listener: (this: void, ...args: T) => void, ...args: []) => void) {
		super(handleListener, handleListener);
	}
}