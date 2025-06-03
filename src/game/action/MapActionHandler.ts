import type {ClickEventListener} from "../../event/InteractionManager";
import {interactionManager} from "../../event/InteractionManager";
import {mapNavigationHandler} from "./MapNavigationHandler";
import {clientPlayer} from "../player/PlayerManager";
import {spawnManager} from "../player/SpawnManager";
import {boatManager} from "../boat/BoatManager";
import {territoryManager} from "../TerritoryManager";
import {hasBorderWith} from "../attack/AttackActionValidator";
import {isLocalGame, isPlaying} from "../GameData";
import {sendPacket, submitGameAction} from "../../network/NetworkManager";
import {SpawnRequestPacket} from "../../network/protocol/packet/game/SpawnRequestPacket";
import {gameInitHandler, gameStartRegistry} from "../Game";
import {gameTicker} from "../GameTicker";
import {AttackActionPacket} from "../../network/protocol/packet/game/AttackActionPacket";
import {findStartingPoint} from "../../map/area/BoatPathfinding";
import {BoatActionPacket} from "../../network/protocol/packet/game/BoatActionPacket";

/**
 * Default map click action handler.
 * Executes the selected action on the clicked tile.
 */
class MapActionHandler implements ClickEventListener {
	private action: (tile: number) => void;
	private power: number;

	/**
	 * Set the action to execute on a tile click.
	 * @param action The action to execute.
	 */
	setAction(action: (tile: number) => void) {
		this.action = action;
	}

	/**
	 * Set the power to attack with
	 * @param power The power to attack with
	 */
	setPower(power: number) {
		this.power = power;
	}

	onClick(x: number, y: number): void {
		this.action(mapNavigationHandler.getIndex(x, y));
	}

	test(x: number, y: number, _element: EventTarget | null): boolean {
		return isPlaying && !gameTicker.isPaused && mapNavigationHandler.isOnMap(x, y);
	}

	/**
	 * Action causing the player spawn to be selected when clicking on unclaimed territory
	 */
	static spawnSelectAction(this: void, tile: number) {
		if (territoryManager.getOwner(tile) === territoryManager.OWNER_NONE - 1) return;
		if (!spawnManager.isValidSpawnPoint(tile)) return;
		if (!isLocalGame) sendPacket(new SpawnRequestPacket(tile));
		spawnManager.selectSpawnPoint(clientPlayer.id, tile)
		spawnManager.finalizeSelection();
	}

	/**
	 * Action starting an attack against the clicked player, if the player can't be reached, a boat is sent instead
	 */
	static attackAction(this: void, tile: number) {
		if (hasBorderWith(clientPlayer, territoryManager.getOwner(tile))) {
			submitGameAction(new AttackActionPacket(clientPlayer.id, territoryManager.getOwner(tile) === territoryManager.OWNER_NONE ? clientPlayer.id : territoryManager.getOwner(tile), mapActionHandler.power));
		} else {
			const coast = boatManager.findCoastNear(tile);
			if (coast === null) return;
			const start = findStartingPoint(coast);
			if (start === null) return;
			submitGameAction(new BoatActionPacket(clientPlayer.id, start, coast, mapActionHandler.power));
		}
	}
}

export const mapActionHandler = new MapActionHandler();

interactionManager.click.register(mapActionHandler, -100);

gameInitHandler.register(() => mapActionHandler.setAction(MapActionHandler.spawnSelectAction));
gameStartRegistry.register(() => mapActionHandler.setAction(MapActionHandler.attackAction));