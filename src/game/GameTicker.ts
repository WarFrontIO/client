import {EventHandlerRegistry} from "../event/EventHandlerRegistry";

class GameTicker {
	private readonly TICK_INTERVAL = 1000 / 20; // 50ms
	private ticker: NodeJS.Timeout;
	private tickCount: number;

	/**
	 * Registry for game tick listeners.
	 * @see GameTickListener
	 */
	registry: EventHandlerRegistry<GameTickListener> = new EventHandlerRegistry(false, listener => listener.tick());

	/**
	 * Starts and resets the game ticker.
	 * Do not call this to implement a pause behavior.
	 * @internal
	 */
	start() {
		this.tickCount = 0;
		this.ticker = setInterval(() => this.tick(), this.TICK_INTERVAL);
	}

	/**
	 * Stops the game ticker.
	 * Do not call this to implement a pause behavior.
	 * @internal
	 */
	stop() {
		clearInterval(this.ticker);
	}

	private tick() {
		this.tickCount++;
		this.registry.broadcast();
	}

	/**
	 * Gets the current tick count.
	 *
	 * Do not use this to calculate time differences.
	 * There is no guarantee that the ticker runs at a constant rate.
	 * @returns The current tick count.
	 */
	getTickCount(): number {
		return this.tickCount;
	}
}

/**
 * Listener for game ticks.
 * Game tick listeners are called once per game tick allowing for game logic to be updated.
 *
 * Register a listener with the game ticker to receive tick events.
 * @see GameTicker.registry
 * @see EventHandlerRegistry.register
 */
export interface GameTickListener {
	/**
	 * Called once per game tick.
	 */
	tick(): void;
}

export const gameTicker = new GameTicker();