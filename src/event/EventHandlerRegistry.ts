/**
 * Simple event handler registry for managing event listeners.
 * Mainly used to manage game event listeners.
 */
export class EventHandlerRegistry<T> {
	protected listeners: T[] = [];

	/**
	 * Creates a new event handler registry.
	 * @param callImmediately If true, the handleListener method is called for each listener immediately after registration.
	 * @param handleListener The method to call on each listener.
	 */
	constructor(
		private readonly callImmediately: boolean = false,
		private readonly handleListener: (listener: T) => void
	) {}

	/**
	 * Registers a listener to receive events.
	 * If callImmediately is true, the listener is called immediately after registration (e.g. for initialization).
	 * @param listener The listener to register.
	 */
	register(listener: T) {
		this.listeners.push(listener);
		if (this.callImmediately) {
			this.handleListener(listener);
		}
	}

	/**
	 * Unregisters a listener to no longer receive events.
	 * @param listener The listener to unregister.
	 */
	unregister(listener: T) {
		this.listeners = this.listeners.filter(l => l !== listener);
	}

	/**
	 * Broadcasts an event to all registered listeners.
	 * @internal Only call this method if you are the event source.
	 */
	broadcast() {
		this.listeners.forEach(this.handleListener);
	}
}