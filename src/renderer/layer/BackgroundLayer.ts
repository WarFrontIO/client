import {RendererLayer} from "./RendererLayer";
import {getSetting} from "../../util/settings/UserSettingManager";

/**
 * A simple background layer that fills the canvas with a color.
 * This also clears any previous content on the canvas, so transparent layers don't leave artifacts.
 */
class BackgroundLayer implements RendererLayer {
	render(context: CanvasRenderingContext2D): void {
		context.fillStyle = getSetting("theme").getBackgroundColor().toString();
		context.fillRect(0, 0, context.canvas.width, context.canvas.height);
	}
}

export const backgroundLayer = new BackgroundLayer();