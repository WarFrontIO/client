import {PriorityList} from "../util/PriorityList";

/**
 * Registry for prioritized event handlers.
 * Event handlers are called in the order they were registered (if not prioritized).
 * The first handler that returns true for the test method is chosen.
 * Use this for non-propagating event handling (e.g. click events).
 */
export class PrioritizedEventHandlerRegistry<T extends {test: (...args: never[]) => boolean}> {
	protected listeners = new PriorityList<T>();
	private currentListener: T | undefined;

	/**
	 * Registers a listener to receive events.
	 * @param listener The listener to register.
	 * @param priority The priority of the listener. Higher values are called first.
	 */
	register(listener: T, priority: number = 0) {
		this.listeners.add(listener, priority);
	}

	/**
	 * Unregisters a listener to no longer receive events.
	 * @param listener The listener to unregister.
	 */
	unregister(listener: T) {
		this.listeners.remove(listener);
	}

	/**
	 * Resets current active listener.
	 * Some events require to keep track of the current listener, since their events are not fired at the same positions.
	 * Call this method after the event has been handled to prevent the same listener from being called again.
	 */
	reset(): void {
		this.currentListener = undefined;
	}

	/**
	 * Returns whether a listener has been chosen.
	 */
	has() {
		return this.currentListener !== undefined;
	}

	/**
	 * Chooses the listener to receive events.
	 * The first listener that returns true for the test method is chosen.
	 * @param args The arguments to pass to the test
	 */
	choose(...args: Parameters<T["test"]>): void {
		this.currentListener = this.listeners.find(l => l.test(...args));
	}

	/**
	 * Calls the listener that was chosen by the choose method.
	 * If no listener was chosen, nothing happens.
	 * @param handler closure to call on the chosen listener.
	 */
	call(handler: (listener: T) => void): void {
		if (this.currentListener) {
			handler(this.currentListener);
		}
	}
}