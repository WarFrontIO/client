import {handlePath} from "./util/PathHandler";

window.addEventListener("load", () => {
	handlePath();

	//TODO: automate this:
	require("./renderer/GameTheme");
	require("./renderer/GameRenderer");
	require("./renderer/layer/debug/BoatBotWaypointDebugRenderer");
	require("./renderer/layer/debug/BoatMeshDebugRenderer");
	require("./renderer/layer/debug/NameDepthDebugRenderer");
	require("./renderer/layer/debug/TerrainDepthRenderer");
	require("./renderer/layer/debug/TerrainInfluenceRenderer");
});