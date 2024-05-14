import {Player} from "./Player";
import {territoryManager} from "../TerritoryManager";
import {random} from "../Random";
import {attackActionHandler} from "../action/AttackActionHandler";
import {onNeighbors} from "../../util/MathUtil";
import {Team} from "../Team";

export class BotPlayer extends Player {
    constructor(id: number, team: Team = null) {
        super(id, "Bot", team);
    }

	//TODO: Implement bot logic
    //Note attacks are treated the same as donations, so the bot may donate to bordering teammates.
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
		if (targets.length < 1) {
			return;
		}
		if (targets.includes(territoryManager.OWNER_NONE)) {
			attackActionHandler.preprocessAttack(this.id, territoryManager.OWNER_NONE, 0.1);
			return;
		}
		attackActionHandler.preprocessAttack(this.id, targets[random.nextInt(targets.length)], 0.1);
	}
}