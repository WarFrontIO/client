import { GameMap } from "../map/GameMap";
import { GameRenderer } from "../renderer/GameRenderer";
import { MapNavigationHandler } from "./action/MapNavigationHandler";
import { TerritoryManager } from "./TerritoryManager";
import { PlayerManager } from "./player/PlayerManager";
import { MapActionHandler } from "./action/MapActionHandler";
import { random } from "./Random";
import { gameTicker } from "./GameTicker";
import { PlayerNameRenderingManager } from "../renderer/manager/PlayerNameRenderingManager";
import { AttackActionHandler } from "./action/AttackActionHandler";
import { GameMode } from "./mode/GameMode";

export class Game {

	/**
	 * The map of the current game.
	 */
	public map: GameMap;
	/**
	 * The current game mode.
	 */
	public mode: GameMode;

	public players: PlayerManager;

	/**
	 * Whether the game is currently running.
	 */
	public isPlaying: boolean;
	/**
	 * Local games are directly played on the client without any server interaction.
	 */
	public isLocalGame: boolean;

	public constructor(map: GameMap, mode: GameMode, players: PlayerManager) {
		this.map = map;
		this.mode = mode;
		this.players = players;
		this.isLocalGame = true;
	}

	/**
	 * Start a new game with the given map.
	 * @param map The map to start the game with.
	 * @param mode The game mode to use.
	 */
	public startGame() {
		this.isPlaying = true;
		random.reset(23452345);
	}

	/**
	 * Start the game cycle.
	 * @internal This method is called by the spawn manager when the player has selected a spawn point.
	 */
	public startGameCycle() {
		console.log('starting game cycle')
		gameTicker.start();
	}


}