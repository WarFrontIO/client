import {ClickEventListener, interactionManager} from "../../event/InteractionManager";
import {mapNavigationHandler} from "./MapNavigationHandler";
import {clientPlayer} from "../player/PlayerManager";
import {spawnManager} from "../player/SpawnManager";
import {boatManager} from "../boat/BoatManager";
import {territoryManager} from "../TerritoryManager";
import {hasBorderWith, preprocessAttack} from "../attack/AttackActionValidator";

/**
 * Default map click action handler.
 * Executes the selected action on the clicked tile.
 */
class MapActionHandler implements ClickEventListener {
	private action: (tile: number) => void;

	/**
	 * Enables the map action handler.
	 */
	enable() {
		this.setAction(tile => spawnManager.isSelecting ? spawnManager.requestSpawn(tile) : hasBorderWith(clientPlayer, territoryManager.getOwner(tile)) ? preprocessAttack(clientPlayer.id, territoryManager.getOwner(tile), 200) : boatManager.requestBoat(tile, 200));
		interactionManager.click.register(this);
	}

	/**
	 * Disables the map action handler.
	 */
	disable() {
		interactionManager.click.unregister(this);
	}

	/**
	 * Set the action to execute on a tile click.
	 * @param action The action to execute.
	 */
	setAction(action: (tile: number) => void) {
		this.action = action;
	}

	onClick(x: number, y: number): void {
		this.action(mapNavigationHandler.getIndex(x, y));
	}

	test(x: number, y: number, element: string): boolean {
		return !element && mapNavigationHandler.isOnMap(x, y);
	}
}

export const mapActionHandler = new MapActionHandler();