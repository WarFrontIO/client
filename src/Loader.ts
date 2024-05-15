import {GameRenderer} from "./renderer/GameRenderer";
import {TileManager} from "./map/TileManager";
import {openMenu} from "./ui/ModuleLoader";
import {GameTheme} from "./renderer/theme/GameTheme";
import {PastelTheme} from "./renderer/theme/PastelTheme";

export const tileManager = new TileManager();
export const gameRenderer = new GameRenderer();

window.addEventListener("load", () => {
	openMenu("MainMenu");
});

//TODO: Move this to user settings when implemented
export const theme : GameTheme = new PastelTheme();