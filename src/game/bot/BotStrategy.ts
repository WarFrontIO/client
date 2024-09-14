import {random} from "../Random";
import {onNeighbors} from "../../util/MathUtil";
import {territoryManager} from "../TerritoryManager";
import {gameMode} from "../GameData";
import {BotPlayer} from "./BotPlayer";
import {playerManager} from "../player/PlayerManager";

export class BotStrategy {
	constructor(
		private readonly dropAttackChance: number,
		private readonly targetSmallChance: number,
		private readonly targetNonPlayerChance: number,
		private readonly densityChoiceChance: number,
	) {}

	/**
	 * @returns The target of this bot strategy, or null if no attack should be performed
	 */
	getTarget(player: BotPlayer): number | null {
		//TODO: Neighbor logic should probably be done using tile updates instead of every tick
		let targets: number[] = [];
		for (const border of player.borderTiles) {
			onNeighbors(border, neighbor => {
				const owner = territoryManager.getOwner(neighbor);
				if (owner !== player.id && !targets.includes(owner)) {
					targets.push(owner);
				}
			});
		}
		targets = targets.filter(target => gameMode.canAttack(player.id, target));
		if (targets.length < 1) {
			return null;
		}

		//Always attack neutral territories if possible
		if (targets.includes(territoryManager.OWNER_NONE)) {
			return territoryManager.OWNER_NONE;
		}

		//Chance to not attack, might cause a boat to be spawned instead
		if (random.nextInt(100) < this.dropAttackChance) {
			return null;
		}

		//Prefer attacking players with 10% or less of the player's territories (also kinda to make the game map look less chaotic)
		if (random.nextInt(100) < this.targetSmallChance) {
			const smallTargets = targets.filter(target => playerManager.getPlayer(target).getTerritorySize() < player.getTerritorySize() * 0.1);
			if (smallTargets.length > 0) {
				targets = smallTargets;
			}
		}

		//Prefer attacking non-player territories
		if (random.nextInt(100) < this.targetNonPlayerChance) {
			const nonPlayerTargets = targets.filter(target => playerManager.isBot(target));
			if (nonPlayerTargets.length > 0) {
				targets = nonPlayerTargets;
			}
		}

		//Attack the player with the lowest density
		if (random.nextInt(100) < this.densityChoiceChance) {
			let lowestDensity = Infinity, lowestDensityTarget = null;
			for (const target of targets) {
				const player = playerManager.getPlayer(target);
				const density = player.getTroops() / player.getTerritorySize();
				if (density < lowestDensity) {
					lowestDensity = density;
					lowestDensityTarget = target;
				}
			}
			return lowestDensityTarget;
		}

		return targets[random.nextInt(targets.length)];
	}
}

/**
 * Selects a bot strategy.
 */
export function selectBotStrategy(): BotStrategy {
	return new BotStrategy(5 + random.nextInt(10), random.nextInt(100), random.nextInt(100), random.nextInt(20));
}