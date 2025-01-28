import {CachedLayer} from "./CachedLayer";
import {mapTransformHandler} from "../../event/MapTransformHandler";
import {gameMap} from "../../game/GameData";
import {gameLoadRegistry} from "../../game/Game";
import {TerritoryRenderingManager} from "../manager/TerritoryRenderingManager";
import {getSetting, registerSettingListener} from "../../util/settings/UserSettingManager";
import {registerTransactionExecutor} from "../../game/transaction/TransactionExecutors";
import {TerritoryTransaction} from "../../game/transaction/TerritoryTransaction";
import {borderManager} from "../../game/BorderManager";

/**
 * Territory renderer.
 * Renders territory colors on the map (e.g. player territories).
 * @internal
 */
class TerritoryRenderer extends CachedLayer {
	readonly manager: TerritoryRenderingManager = new TerritoryRenderingManager(this.context);

	init(): void {
		this.resizeCanvas(gameMap.width, gameMap.height);
	}

	onMapMove(this: void, x: number, y: number): void {
		territoryRenderer.dx = x;
		territoryRenderer.dy = y;
	}

	onMapScale(this: void, scale: number): void {
		territoryRenderer.scale = scale;
	}
}

export const territoryRenderer = new TerritoryRenderer();

mapTransformHandler.scale.register(territoryRenderer.onMapScale);
mapTransformHandler.move.register(territoryRenderer.onMapMove);
gameLoadRegistry.register(territoryRenderer.init.bind(territoryRenderer));

registerSettingListener("theme", territoryRenderer.manager.forceRepaint.bind(this));

registerTransactionExecutor(TerritoryTransaction, function (this: TerritoryTransaction) {
	//TODO: this needs to be less magical for clearing
	const borders = borderManager.transitionTiles(this.tiles, this.attacker?.id ?? -1, this.defendant?.id ?? -1);
	if (this.attacker) {
		territoryRenderer.manager.paintTiles(borders.territory, getSetting("theme").getTerritoryColor(this.attacker.baseColor));
		territoryRenderer.manager.paintTiles(borders.attacker, getSetting("theme").getBorderColor(this.attacker.baseColor));
	} else {
		territoryRenderer.manager.clearTiles(this.tiles);
	}

	if (this.defendant) {
		territoryRenderer.manager.paintTiles(borders.defender, getSetting("theme").getBorderColor(this.defendant.baseColor));
	}
});