import {Player} from "../player/Player";
import {gameTicker} from "../GameTicker";

export abstract class GameResult {
	readonly time: number;
	readonly winners: Player[];

	constructor(winners: Player[]) {
		this.time = gameTicker.getElapsedTime();
		this.winners = winners;
	}

	/**
	 * Returns a string indicating the winner of the game.
	 * For example, the team name in team modes or the player name in single player mode.
	 * @returns The string indicating the winner of the game.
	 */
	abstract getWinnerString(): string;
}