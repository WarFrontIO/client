import {RendererLayer} from "./RendererLayer";
import {playerManager} from "../../game/player/PlayerManager";
import {mapNavigationHandler} from "../../game/action/MapNavigationHandler";

//TODO: This requires major refactoring
//TODO: Invert the dependency on Player class
export class NameRenderer implements RendererLayer {
	render(context: CanvasRenderingContext2D): void {
		context.textRendering = "optimizeSpeed";
		context.textAlign = "center";
		const zoom = mapNavigationHandler.zoom;
		const x = mapNavigationHandler.x;
		const y = mapNavigationHandler.y;
		//TODO: Optimize this
		playerManager.players.forEach(player => {
			player.update();
			context.fillStyle = "rgb(255, 255, 255)";
			context.font = "bold " + (player.nameSize * zoom) + "px Arial";
			context.textBaseline = "bottom";
			context.fillText(player.name, player.nameX * zoom + x, player.nameY * zoom + y);
			context.font = "bold " + (player.troopSize * zoom) + "px Arial";
			context.textBaseline = "top";
			context.fillText(this.formatTroops(player.troops), player.nameX * zoom + x, player.nameY * zoom + y);
		});
	}

	formatTroops(troops: number): string {
		let result = "";
		while (troops > 1000) {
			result = (troops % 1000).toString().padStart(3, "0") + result;
			troops = Math.floor(troops / 1000);
			if (troops > 0) result = "." + result;
		}
		return troops.toString() + result;
	}
}