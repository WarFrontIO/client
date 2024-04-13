import {Player} from "./Player";
import {BotPlayer} from "./BotPlayer";
import {spawnManager} from "./SpawnManager";
import {gameTicker, GameTickListener} from "../GameTicker";

class PlayerManager implements GameTickListener {
	players: Player[];
	private bots: BotPlayer[];

	constructor() {
		gameTicker.registry.register(this);
	}

	init(humans: Player[], clientId: number, maxPlayers: number): void {
		this.players = humans;
		clientPlayer = this.players[clientId];
		this.bots = [];
		while (this.players.length < maxPlayers) {
			const bot = new BotPlayer(this.players.length);
			this.players.push(bot);
			this.bots.push(bot);
			spawnManager.randomSpawnPoint(bot);
		}
	}

	getPlayer(id: number): Player {
		return this.players[id];
	}

	tick(): void {
		this.bots.forEach(bot => bot.tick());
		if (gameTicker.tickCount % 10 === 0) {
			this.players.forEach(player => player.income());
		}
	}
}

export const playerManager = new PlayerManager();
export let clientPlayer: Player;