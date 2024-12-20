import {MultiSelectSetting} from "../../../util/MultiSelectSetting";
import {BoatMeshDebugRenderer} from "./BoatMeshDebugRenderer";
import {RendererLayer} from "../RendererLayer";
import {NameDepthDebugRenderer} from "./NameDepthDebugRenderer";

export const debugRendererLayers = MultiSelectSetting.init()
	.option("boat-navigation-mesh", new BoatMeshDebugRenderer(), "Boat Navigation Mesh", false)
	.option("name-depth", new NameDepthDebugRenderer(), "Name Depth", false)

export interface DebugRendererLayer extends Omit<RendererLayer, "invalidateCaches"> {
	useCache: boolean;
}