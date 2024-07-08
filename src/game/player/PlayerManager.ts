import { Player } from "./Player";
import { BotPlayer } from "./BotPlayer";
import { SpawnManager } from "./SpawnManager";
import { gameTicker, GameTickListener } from "../GameTicker";
import { GameRenderer } from "../../renderer/GameRenderer";
import { TerritoryManager } from "../TerritoryManager";
import { Game } from "../Game";
import { AttackActionHandler } from "../action/AttackActionHandler";

export class PlayerManager implements GameTickListener {
	private players: Player[];
	private bots: BotPlayer[];
	public clientPlayer: Player;

	public spawnManager: SpawnManager
	public attackActionHandler: AttackActionHandler
	public game: Game
	public territoryManager: TerritoryManager
	public gameRenderer: GameRenderer

	constructor(spawnManager: SpawnManager, attackActionHandler: AttackActionHandler, game: Game, territoryManager: TerritoryManager, gameRenderer: GameRenderer) {
		this.spawnManager = spawnManager
		this.attackActionHandler = attackActionHandler
		this.game = game
		this.territoryManager = territoryManager
		this.gameRenderer = gameRenderer
		gameTicker.registry.register(this);
	}

	/**
	 * Initializes the player manager with the given players.
	 * @param humans human players, one for local games, multiple for online games.
	 * @param clientId Player ID of the client player (the player that is controlled this client).
	 * @param maxPlayers The maximum number of players.
	 */
	init(humans: Player[], clientId: number, maxPlayers: number): void {
		this.players = [];
		this.bots = [];

		this.clientPlayer = humans[clientId];
		for (const player of humans) {
			this.registerPlayer(player, false);
		}

		for (let i = humans.length; i < maxPlayers; i++) {
			this.registerPlayer(new BotPlayer(this.attackActionHandler, this.game, this.territoryManager, this.gameRenderer, this.players.length), true);
		}

		this.gameRenderer.playerNameRenderingManager.finishRegistration(this.players);
	}

	/**
	 * Register a player.
	 * @param player The player to register.
	 * @param isBot Whether the player is a bot.
	 */
	registerPlayer(player: Player, isBot: boolean): void {
		this.gameRenderer.playerNameRenderingManager.registerPlayer(player);
		this.players.push(player);
		if (isBot) {
			this.bots.push(player as BotPlayer);
			this.spawnManager.randomSpawnPoint(player);
		}
	}

	/**
	 * Get the player with the given ID.
	 * @param id The ID of the player.
	 */
	getPlayer(id: number): Player {
		return this.players[id];
	}

	//TODO: bot ticking should be done in a separate bot manager
	tick(): void {
		this.bots.forEach(bot => bot.tick());
		if (gameTicker.getTickCount() % 10 === 0) {
			this.players.forEach(player => player.income());
		}
	}
}