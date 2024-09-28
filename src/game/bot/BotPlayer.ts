import {Player} from "../player/Player";
import {HSLColor} from "../../util/HSLColor";
import {actuallyHandleAttack} from "../attack/AttackActionValidator";
import {BotTrigger, selectBotTriggers} from "./modifier/BotTrigger";
import {BotConstraints, selectBotConstraints} from "./modifier/BotConstraints";
import {BotStrategy, selectBotStrategy} from "./BotStrategy";
import {territoryManager} from "../TerritoryManager";
import {random} from "../Random";
import {onNeighbors} from "../../util/MathUtil";
import {rayTraceWater} from "../../util/VoxelRayTrace";
import {gameMap, gameMode} from "../GameData";
import {boatManager} from "../boat/BoatManager";

export class BotPlayer extends Player {
	protected readonly triggers: BotTrigger[];
	protected readonly constraints: BotConstraints[];
	protected readonly strategy: BotStrategy;

	constructor(id: number) {
		super(id, "Bot", HSLColor.fromRGB(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)));
		this.triggers = selectBotTriggers();
		this.constraints = selectBotConstraints();
		this.strategy = selectBotStrategy();
	}

	tick(): void {
		if (!this.triggers.some(trigger => trigger.trigger())) return;
		if (!this.constraints.every(constraint => constraint.allowAttack())) return;

		const target = this.strategy.getTarget(this);
		if (target !== null) {
			//TODO: Attack percentage should be configurable
			actuallyHandleAttack(this, target, 100);
		} else if (this.waterTiles > 0) {
			const borderTiles = Array.from(this.borderTiles); //TODO: Check the performance hit this causes
			const startTile = borderTiles[random.nextInt(borderTiles.length)];
			const possibleStarts: number[] = [];
			onNeighbors(startTile, tile => {
				if (territoryManager.isWater(tile)) {
					possibleStarts.push(tile);
				}
			});
			if (possibleStarts.length < 1) return;
			const start = possibleStarts[random.nextInt(possibleStarts.length)];
			const end = rayTraceWater(start % gameMap.width, Math.floor(start / gameMap.width), random.next() - 0.5, random.next() - 0.5);
			if (end !== null && gameMode.canAttack(this.id, territoryManager.getOwner(end))) {
				boatManager.addBoatInternal(this, [start, end], 100);
			}
		}
	}
}