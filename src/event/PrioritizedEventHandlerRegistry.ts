import {BasicInteractionListener} from "./InteractionManager";

export class PrioritizedEventHandlerRegistry<T extends BasicInteractionListener> {
	protected listeners: T[] = [];
	private currentListener: T | null = null;

	register(listener: T, prioritize: boolean = false) {
		if (prioritize) {
			this.listeners.unshift(listener);
		} else {
			this.listeners.push(listener);
		}
	}

	unregister(listener: T) {
		this.listeners = this.listeners.filter(l => l !== listener);
	}

	reset(): void {
		this.currentListener = null;
	}

	choose(x: number, y: number): void {
		this.currentListener = this.listeners.find(l => l.test(x, y)) || null;
	}

	call(handler: (listener: T) => void): void {
		if (this.currentListener) {
			handler(this.currentListener);
		}
	}
}