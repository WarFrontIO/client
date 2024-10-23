import {handlePath} from "./util/PathHandler";
import {gameRenderer} from "./renderer/GameRenderer";

window.addEventListener("load", () => {
	handlePath();
	gameRenderer.startRendering();
});