import {ClickEventListener, interactionManager} from "../../event/InteractionManager";
import {mapNavigationHandler} from "./MapNavigationHandler";
import {clientPlayer, playerManager} from "../player/PlayerManager";
import {spawnManager} from "../player/SpawnManager";
import {attackActionHandler} from "./AttackActionHandler";
import {territoryManager} from "../TerritoryManager";

class MapActionHandler implements ClickEventListener {
	action: (tile: number) => void;

	enable() {
		this.action = tile => spawnManager.isSelecting ? spawnManager.selectSpawnPoint(clientPlayer, tile) : attackActionHandler.attackPlayer(clientPlayer.id, territoryManager.getOwner(tile), 0.2);
		interactionManager.click.register(this);
	}

	disable() {
		interactionManager.click.unregister(this);
	}

	onClick(x: number, y: number): void {
		this.action(mapNavigationHandler.getIndex(x, y));
	}

	test(x: number, y: number): boolean {
		return mapNavigationHandler.isOnMap(x, y);
	}
}

export const mapActionHandler = new MapActionHandler();