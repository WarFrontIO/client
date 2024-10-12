import {BasicInteractionListener, InteractionType} from "./InteractionManager";
import {resolveInteraction} from "../ui/UIEventResolver";

/**
 * Registry for prioritized event handlers.
 * Event handlers are called in the order they were registered (if not prioritized).
 * The first handler that returns true for the test method is chosen.
 * Use this for non-propagating event handling (e.g. click events).
 */
export class PrioritizedEventHandlerRegistry<T extends BasicInteractionListener> {
	protected listeners: T[] = [];
	private currentListener: T | null = null;

	//TODO: This should not be known to the registry
	constructor(
		private readonly type: InteractionType
	) {}

	/**
	 * Registers a listener to receive events.
	 * @param listener The listener to register.
	 * @param prioritize If true, the listener is added to the beginning of the stack instead of the end.
	 */
	register(listener: T, prioritize: boolean = false) {
		if (prioritize) {
			this.listeners.unshift(listener);
		} else {
			this.listeners.push(listener);
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
	 * Resets current active listener.
	 * Some events require to keep track of the current listener, since their events are not fired at the same positions.
	 * Call this method after the event has been handled to prevent the same listener from being called again.
	 */
	reset(): void {
		this.currentListener = null;
	}

	/**
	 * Chooses the listener to receive events.
	 * The first listener that returns true for the test method is chosen.
	 * @param x The x coordinate of the event.
	 * @param y The y coordinate of the event.
	 * @param element The element that received the event.
	 */
	choose(x: number, y: number, element: EventTarget | null): void {
		const resolved = resolveInteraction(element as HTMLElement, this.type);
		this.currentListener = this.listeners.find(l => l.test(x, y, resolved ? resolved.id : null)) ?? (resolved ? resolved.listener as T : null);
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