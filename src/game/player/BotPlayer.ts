import {Player} from "./Player";
import {territoryManager} from "../TerritoryManager";
import {random} from "../Random";
import {onNeighbors} from "../../util/MathUtil";
import {HSLColor} from "../../util/HSLColor";
import {actuallyHandleAttack} from "../attack/AttackActionValidator";
import {gameMode} from "../GameData";

export class BotPlayer extends Player {
	constructor(id: number) {
		super(id, "Bot", HSLColor.fromRGB(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)));
	}

	//TODO: Implement bot logic
	tick(): void {
		if (random.nextInt(20) < 19) return;
		let targets: number[] = [];
		for (const border of this.borderTiles) {
			onNeighbors(border, neighbor => {
				const owner = territoryManager.getOwner(neighbor);
				if (owner !== this.id && !targets.includes(owner)) {
					targets.push(owner);
				}
			});
		}
		targets = targets.filter(target => gameMode.canAttack(this.id, target));
		if (targets.length < 1) {
			return;
		}
		if (targets.includes(territoryManager.OWNER_NONE)) {
			actuallyHandleAttack(this, territoryManager.OWNER_NONE, 100);
			return;
		}
		actuallyHandleAttack(this, targets[random.nextInt(targets.length)], 100);
	}
}