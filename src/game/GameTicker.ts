import {EventHandlerRegistry} from "../event/EventHandlerRegistry";

class GameTicker {
	private readonly TICK_INTERVAL = 1000 / 20; // 50ms
	private ticker: NodeJS.Timeout;
	tickCount: number;
	registry: EventHandlerRegistry<GameTickListener> = new EventHandlerRegistry(false, listener => listener.tick());

	start() {
		this.tickCount = 0;
		this.ticker = setInterval(() => this.tick(), this.TICK_INTERVAL);
	}

	stop() {
		clearInterval(this.ticker);
	}

	private tick() {
		this.tickCount++;
		this.registry.broadcast();
	}
}

export interface GameTickListener {
	tick(): void;
}

export const gameTicker = new GameTicker();