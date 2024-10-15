import {MultiSelectSetting} from "../../../util/MultiSelectSetting";
import {BoatMeshDebugRenderer} from "./BoatMeshDebugRenderer";
import {RendererLayer} from "../RendererLayer";

export const debugRendererLayers = MultiSelectSetting.init()
	.option("boat-navigation-mesh", new BoatMeshDebugRenderer(), "Boat Navigation Mesh", false);

export interface DebugRendererLayer extends Omit<RendererLayer, "invalidateCaches"> {
	useCache: boolean;
}