import {MultiSelectSetting} from "../../../util/MultiSelectSetting";
import {BoatMeshDebugRenderer} from "./BoatMeshDebugRenderer";
import {RendererLayer} from "../RendererLayer";
import {NameDepthDebugRenderer} from "./NameDepthDebugRenderer";
import {TerrainDepthRenderer} from "./TerrainDepthRenderer";
import {TerrainInfluenceRenderer} from "./TerrainInfluenceRenderer";

export const debugRendererLayers = MultiSelectSetting.init()
	.option("boat-navigation-mesh", new BoatMeshDebugRenderer(), "Boat Navigation Mesh", false)
	.option("name-depth", new NameDepthDebugRenderer(), "Name Depth", false)
	.option("terrain-depth", new TerrainDepthRenderer(), "Terrain Depth", false)
	.option("tile-influence", new TerrainInfluenceRenderer(), "Tile Influence", false)

export interface DebugRendererLayer extends Omit<RendererLayer, "invalidateCaches"> {
	useCache: boolean;
}