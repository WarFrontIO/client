import {Player} from "./Player";
import {territoryManager} from "../TerritoryManager";
import {random} from "../Random";
import {attackActionHandler} from "../action/AttackActionHandler";
import {getNeighbors} from "../../util/MathUtil";

export class BotPlayer extends Player {
	constructor(id: number) {
		super(id, "Bot", Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256));
	}

	//TODO: Implement bot logic
	tick(): void {
		if (random.nextInt(20) < 19) return;
		let targets: number[] = [];
		for (const border of this.borderTiles) {
			for (const neighbor of getNeighbors(border)) {
				const owner = territoryManager.getOwner(neighbor);
				if (owner !== this.id && !targets.includes(owner)) {
					targets.push(owner);
				}
			}
		}
		if (targets.length < 1) {
			return;
		}
		if (targets.includes(territoryManager.OWNER_NONE)) {
			attackActionHandler.attackPlayer(this.id, territoryManager.OWNER_NONE, 0.1);
			return;
		}
		attackActionHandler.attackPlayer(this.id, targets[random.nextInt(targets.length)], 0.1);
	}
}