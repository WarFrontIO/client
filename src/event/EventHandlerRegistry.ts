export class EventHandlerRegistry<T> {
	protected listeners: T[] = [];

	constructor(
		private readonly callImmediately: boolean = false,
		private readonly handleListener: (listener: T) => void
	) {}

	register(listener: T) {
		this.listeners.push(listener);
		if (this.callImmediately) {
			this.handleListener(listener);
		}
	}

	unregister(listener: T) {
		this.listeners = this.listeners.filter(l => l !== listener);
	}

	broadcast() {
		this.listeners.forEach(this.handleListener);
	}
}