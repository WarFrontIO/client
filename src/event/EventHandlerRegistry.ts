/**
 * Simple event handler registry for managing event listeners.
 * Mainly used to manage game event listeners.
 */
export class EventHandlerRegistry<T extends unknown[]> {
	protected listeners: ((this: void, ...args: T) => void)[] = [];

	/**
	 * Registers a listener to receive events.
	 * Note: you most likely have to bind the listener to the correct context or specify "this: void" in the listener.
	 * @param listener The listener to register.
	 */
	register(listener: (this: void, ...args: T) => void) {
		this.listeners.push(listener);
	}

	/**
	 * Unregisters a listener to no longer receive events.
	 * @param listener The listener to unregister.
	 */
	unregister(listener: (this: void, ...args: T) => void) {
		this.listeners = this.listeners.filter(l => l !== listener);
	}

	/**
	 * Broadcasts an event to all registered listeners.
	 * @param args The arguments to pass to the listeners.
	 * @internal Only call this method if you are the event source.
	 */
	broadcast(...args: T) {
		this.listeners.forEach(listener => listener(...args));
	}
}