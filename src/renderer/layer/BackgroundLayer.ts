import {getSetting, registerSettingListener} from "../../util/settings/UserSettingManager";
import {GameTheme} from "../GameTheme";
import {gameRenderer, rendererContextGameplay, renderingContextInit} from "../GameRenderer";
import {RendererLayer} from "./RendererLayer";
import {GameGLContext} from "../GameGLContext";

//@module renderer

/**
 * A simple background layer that fills the canvas with a color.
 * This also clears any previous content on the canvas, so transparent layers don't leave artifacts.
 */
class BackgroundLayer implements RendererLayer {
	private context: GameGLContext;

	init(context: GameGLContext) {
		this.context = context;
		this.updateTheme(getSetting("theme"));
	}

	updateTheme(theme: GameTheme) {
		if (!this.context) return;
		const color = theme.getBackgroundColor().toRGB();
		this.context.raw.clearColor(color.r / 255, color.g / 255, color.b / 255, color.a);
	}

	render(context: GameGLContext) {
		context.raw.clear(context.raw.COLOR_BUFFER_BIT);
	}
}

export const backgroundLayer = new BackgroundLayer();

registerSettingListener("theme", backgroundLayer.updateTheme.bind(backgroundLayer));
renderingContextInit.register(id => id === rendererContextGameplay && gameRenderer.registerLayer(backgroundLayer));