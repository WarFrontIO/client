import {Player} from "../player/Player";
import {HSLColor} from "../../util/HSLColor";
import {actuallyHandleAttack} from "../attack/AttackActionValidator";
import {BotTrigger, selectBotTriggers} from "./modifier/BotTrigger";
import {BotConstraints, selectBotConstraints} from "./modifier/BotConstraints";
import {BotStrategy, selectBotStrategy} from "./BotStrategy";
import {territoryManager} from "../TerritoryManager";
import {random} from "../Random";
import {gameMap, gameMode} from "../GameData";
import {boatManager} from "../boat/BoatManager";
import {borderManager} from "../BorderManager";

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
		} else if (this.waterTiles > 0 && this.strategy.canSpawnBoat()) {
			const borderTiles = Array.from(borderManager.getBorderTiles(this.id)); //TODO: Check the performance hit this causes
			const startTile = borderTiles[random.nextInt(borderTiles.length)];
			const targets = gameMap.boatTargets.get(startTile);
			if (targets === undefined) return;
			const target = targets[random.nextInt(targets.length)];
			if (gameMode.canAttack(this.id, territoryManager.getOwner(target.tile))) {
				boatManager.addBoatInternal(this, target.path, 100);
			}
		}
	}
}