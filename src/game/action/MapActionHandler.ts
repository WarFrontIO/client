import { ClickEventListener, interactionManager } from "../../event/InteractionManager";
import { MapNavigationHandler } from "./MapNavigationHandler";
import { PlayerManager } from "../player/PlayerManager";
import { SpawnManager } from "../player/SpawnManager";
import { AttackActionHandler } from "./AttackActionHandler";
import { TerritoryManager } from "../TerritoryManager";

/**
 * Default map click action handler.
 * Executes the selected action on the clicked tile.
 */
export class MapActionHandler implements ClickEventListener {
	private action: (tile: number) => void;

	private spawnManager: SpawnManager
	private attackActionHandler: AttackActionHandler
	private playerManager: PlayerManager
	private territoryManager: TerritoryManager
	private mapNavigationHandler: MapNavigationHandler

	constructor(spawnManager: SpawnManager, actionAttackHandler: AttackActionHandler, playerManager: PlayerManager, territoryManager: TerritoryManager, mapNavigationHandler: MapNavigationHandler) {
		this.spawnManager = spawnManager
		this.attackActionHandler = actionAttackHandler
		this.playerManager = playerManager
		this.territoryManager = territoryManager
		this.mapNavigationHandler = mapNavigationHandler
	}

	/**
	 * Enables the map action handler.
	 */
	enable() {
		this.setAction(tile => this.spawnManager.isSelecting ? this.spawnManager.selectSpawnPoint(this.playerManager.clientPlayer, tile) : this.attackActionHandler.preprocessAttack(this.playerManager.clientPlayer.id, this.territoryManager.getOwner(tile), 0.2));
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
		this.action(this.mapNavigationHandler.getIndex(x, y));
	}

	test(x: number, y: number): boolean {
		return this.mapNavigationHandler.isOnMap(x, y);
	}
}