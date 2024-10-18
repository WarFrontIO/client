import {playerManager} from "../player/PlayerManager";
import {territoryManager} from "../TerritoryManager";
import {Player} from "../player/Player";
import {AttackActionPacket} from "../../network/protocol/packet/game/AttackActionPacket";
import {attackActionHandler} from "./AttackActionHandler";
import {packetRegistry, submitGameAction} from "../../network/NetworkManager";
import {gameMap, gameMode, isLocalGame} from "../GameData";
import {borderManager} from "../BorderManager";

/**
 * Filters out invalid attacks and submits the attack action.
 * @param attacker The player that is attacking
 * @param target The player that is being attacked
 * @param power The percentage of troops that are attacking
 */
export function preprocessAttack(attacker: number, target: number, power: number): void {
	if (!isLocalGame && !(gameMode.canAttack(attacker, target) && hasBorderWith(playerManager.getPlayer(attacker), target))) {
		return; // No need to send an invalid attack. For local games, we'll do the same check in the handler anyway
	}

	submitGameAction(new AttackActionPacket(attacker, target === territoryManager.OWNER_NONE ? attacker : target, power));
}

export function hasBorderWith(player: Player, target: number): boolean {
	for (const tile of borderManager.getBorderTiles(player.id)) {
		const x = tile % gameMap.width;
		const y = Math.floor(tile / gameMap.width);
		if (x > 0 && territoryManager.isOwner(tile - 1, target)) {
			return true;
		}
		if (x < gameMap.width - 1 && territoryManager.isOwner(tile + 1, target)) {
			return true;
		}
		if (y > 0 && territoryManager.isOwner(tile - gameMap.width, target)) {
			return true;
		}
		if (y < gameMap.height - 1 && territoryManager.isOwner(tile + gameMap.width, target)) {
			return true;
		}
	}
	return false;
}

//TODO: clean this up, starting pixels should be calculated here and not in the handler itself
packetRegistry.handle(AttackActionPacket, function (): void {
	const target = this.target === this.attacker ? territoryManager.OWNER_NONE : this.target;
	if (!gameMode.canAttack(this.attacker, target)) {
		return;
	}

	//TODO: Move these into a general validation function
	const attacker = playerManager.getPlayer(this.attacker);
	if (!attacker || !attacker.isAlive()) {
		return; // invalid origin player
	}
	if (target !== territoryManager.OWNER_NONE && !(playerManager.getPlayer(target) && playerManager.getPlayer(target).isAlive())) {
		return; // invalid target player
	}

	actuallyHandleAttack(attacker, target, this.power);
});

/**
 * Actually handles the attack action.
 * @param attacker The player that is attacking
 * @param target The player that is being attacked
 * @param power The percentage of troops that are attacking
 */
export function actuallyHandleAttack(attacker: Player, target: number, power: number): void {
	const troopCount = Math.floor(attacker.getTroops() * Math.min(1000, power) / 1000);
	attacker.removeTroops(troopCount);

	if (target === territoryManager.OWNER_NONE) {
		attackActionHandler.attackUnclaimed(attacker, troopCount);
		return;
	}
	attackActionHandler.attackPlayer(attacker, playerManager.getPlayer(target), troopCount);
}