import {territoryManager} from "../TerritoryManager";
import {HSLColor} from "../../util/HSLColor";
import {GameResult} from "../result/GameResult";

/**
 * All game mode-specific logic should be implemented in a subclass of this class.
 * If needed, add more methods to this class to implement the desired game mode.
 */
export abstract class GameMode {
	/**
	 * Returns whether a player can attack another player.
	 * @param attacker The player that wants to attack.
	 * @param target The player that is attacked.
	 * @returns true if the player can attack the target, false otherwise.
	 */
	canAttack(attacker: number, target: number): boolean {
		return attacker !== target && target !== territoryManager.OWNER_NONE - 1;
	}

	/**
	 * Processes the player color for this game mode.
	 * Note that the color will later be passed through the theme for further processing.
	 * @param _player The player id.
	 * @param color The player color.
	 * @returns The processed player color.
	 */
	processPlayerColor(_player: number, color: HSLColor): HSLColor {
		return color;
	}

	/**
	 * Returns the result of the game if it can be considered finished.
	 * @returns The result of the game or null if the game is still in progress
	 */
	abstract getResult(): GameResult | null;
}