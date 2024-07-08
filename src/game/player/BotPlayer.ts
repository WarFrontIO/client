import { Player } from "./Player";
import { TerritoryManager } from "../TerritoryManager";
import { random } from "../Random";
import { AttackActionHandler } from "../action/AttackActionHandler";
import { onNeighbors } from "../../util/MathUtil";
import { HSLColor } from "../../util/HSLColor";
import { Game } from "../Game";
import { GameRenderer } from "../../renderer/GameRenderer";

export class BotPlayer extends Player {

	constructor(attackActionHandler: AttackActionHandler, game: Game, territoryManager: TerritoryManager, gameRenderer: GameRenderer, id: number) {
		super(attackActionHandler, game, territoryManager, gameRenderer, id, "Bot", HSLColor.fromRGB(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)));
	}

	//TODO: Implement bot logic
	tick(): void {
		if (random.nextInt(20) < 19) return;
		let targets: number[] = [];
		for (const border of this.borderTiles) {
			onNeighbors(border, neighbor => {
				const owner = this.territoryManager.getOwner(neighbor);
				if (owner !== this.id && !targets.includes(owner)) {
					targets.push(owner);
				}
			}, this.game.map.width, this.game.map.height);
		}
		if (targets.length < 1) {
			return;
		}
		if (targets.includes(TerritoryManager.OWNER_NONE)) {
			this.attackActionHandler.preprocessAttack(this.id, TerritoryManager.OWNER_NONE, 0.1);
			return;
		}
		this.attackActionHandler.preprocessAttack(this.id, targets[random.nextInt(targets.length)], 0.1);
	}
}