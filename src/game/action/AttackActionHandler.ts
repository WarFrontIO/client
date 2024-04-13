import {clientPlayer, playerManager} from "../player/PlayerManager";
import {gameTicker, GameTickListener} from "../GameTicker";
import {territoryManager} from "../TerritoryManager";
import {random} from "../Random";
import {gameMap} from "../Game";
import {Player} from "../player/Player";

class AttackActionHandler implements GameTickListener {
	attacks: Attack[] = [];
	playerIndex: Attack[][] = [];

	constructor() {
		gameTicker.registry.register(this);
	}

	attackPlayer(player: number, target: number, percentage: number): void {
		if (player === clientPlayer.id) {
			console.log(playerManager.getPlayer(player).troops + "troops attacking " + target + " with " + percentage + " troops.");
		}
		if (player === target || target === territoryManager.OWNER_NONE - 1) {
			return;
		}
		if (!this.playerIndex[player]) this.playerIndex[player] = [];
		if (!this.playerIndex[target]) this.playerIndex[target] = [];

		let troopCount = Math.floor(playerManager.getPlayer(player).troops * percentage);
		playerManager.getPlayer(player).troops -= troopCount;

		const parent = this.playerIndex[player][target];
		if (parent) {
			parent.troops += troopCount;
			return;
		}

		const opposite = this.playerIndex[target][player];
		if (opposite) {
			if (opposite.troops > troopCount) {
				opposite.troops -= troopCount;
				return;
			}
			this.attacks.splice(this.attacks.indexOf(opposite), 1);
			this.playerIndex[target][player] = null;
			troopCount -= opposite.troops;
		}

		const attack = new Attack();
		attack.player = player;
		attack.target = target;
		attack.troops = troopCount;
		this.attacks.push(attack);
		this.playerIndex[player][target] = attack;
	}

	tick(): void {
		for (const attack of this.attacks) {
			attack.time++;
			if (attack.troops < 1) {
				this.attacks.splice(this.attacks.indexOf(attack), 1);
				this.playerIndex[attack.player][attack.target] = null;
				continue;
			}

			let tiles = this.calculateAttackedTiles(attack.player, attack.target);
			if (tiles.length < 1) {
				playerManager.getPlayer(attack.player).troops += attack.troops;
				this.attacks.splice(this.attacks.indexOf(attack), 1);
				this.playerIndex[attack.player][attack.target] = null;
				continue;
			}

			while (attack.time > 0) {
				if (tiles.length < 1) {
					break;
				}
				const target = tiles[random.nextInt(tiles.length)];
				if (territoryManager.getOwner(target) !== attack.target) {
					tiles.splice(tiles.indexOf(target), 1);
					continue;
				}
				const attackCost = this.calculateAttackCost(playerManager.getPlayer(attack.target));
				const defenceCost = Math.floor(attackCost / 2);
				if (attack.troops < attackCost + 1) {
					playerManager.getPlayer(attack.player).troops += attack.troops;
					this.attacks.splice(this.attacks.indexOf(attack), 1);
					this.playerIndex[attack.player][attack.target] = null;
					break;
				}
				const timeCost = 3 / tiles.length * this.calculateSpeedFactor(playerManager.getPlayer(attack.player), playerManager.getPlayer(attack.target)); //TODO
				if (attack.time < timeCost) {
					break;
				}
				attack.troops -= attackCost + 1;
				attack.time -= timeCost;
				if (attack.target !== territoryManager.OWNER_NONE) playerManager.getPlayer(attack.target).troops = Math.max(0, playerManager.getPlayer(attack.target).troops - defenceCost);
				territoryManager.conquer(target, attack.player);
			}
		}
	}

	//Note: These are weighted, tiles with multiple neighbors appear more than once
	calculateAttackedTiles(player: number, target: number): number[] {
		const result = [], tileOwners = territoryManager.tileOwners;
		for (const tile of playerManager.getPlayer(player).borderTiles) {
			const x = tile % gameMap.width;
			const y = Math.floor(tile / gameMap.width);
			if (x > 0 && tileOwners[tile - 1] === target) {
				result.push(tile - 1);
			}
			if (x < gameMap.width - 1 && tileOwners[tile + 1] === target) {
				result.push(tile + 1);
			}
			if (y > 0 && tileOwners[tile - gameMap.width] === target) {
				result.push(tile - gameMap.width);
			}
			if (y < gameMap.height - 1 && tileOwners[tile + gameMap.width] === target) {
				result.push(tile + gameMap.width);
			}
		}
		return result;
	}

	calculateAttackCost(target: Player): number {
		if (!target) return 0;
		return Math.floor(target.troops / target.territorySize);
	}

	calculateSpeedFactor(player: Player, target: Player): number {
		if (!target) return 1;
		return Math.max(0.3, Math.min(2, target.territorySize / player.territorySize))
	}

	clear(): void {
		this.attacks = [];
		this.playerIndex = [];
	}
}

class Attack {
	player: number;
	target: number;
	troops: number;
	time: number = 0
}

export const attackActionHandler = new AttackActionHandler();