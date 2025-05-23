import {GameGLContext} from "../GameGLContext";
import {GameFont} from "../GameFont";

// Shaders are inlined by the build process
export const textureCompositeVertexShader = (ctx: GameGLContext) => ctx.loadVertexShader("TextureCompositeShader.vert");
export const colorCompositeVertexShader = (ctx: GameGLContext) => ctx.loadVertexShader("ColorCompositeShader.vert");
export const compositeVertexShader = (ctx: GameGLContext) => ctx.loadVertexShader("CompositeShader.vert");
export const simpleTextureVertexShader = (ctx: GameGLContext) => ctx.loadVertexShader("SimpleTextureShader.vert");
export const mapGridLookupVertexShader = (ctx: GameGLContext) => ctx.loadVertexShader("MapGridLookupShader.vert");
export const mapGridCompositeVertexShader = (ctx: GameGLContext) => ctx.loadVertexShader("MapGridCompositeShader.vert");
export const msdfTextureVertexShader = (ctx: GameGLContext) => ctx.loadVertexShader("MSDFTextureShader.vert");

export const simpleTextureFragmentShader = (ctx: GameGLContext) => ctx.loadFragmentShader("SimpleTextureShader.frag");
export const mapRenderingFragmentShader = (ctx: GameGLContext) => ctx.loadFragmentShader("MapRenderingShader.frag");
export const territoryRenderingFragmentShader = (ctx: GameGLContext) => ctx.loadFragmentShader("TerritoryRenderingShader.frag");
export const linearLookupFragmentShader = (ctx: GameGLContext) => ctx.loadFragmentShader("LinearLookupShader.frag");
export const distanceMapFragmentShader = (ctx: GameGLContext) => ctx.loadFragmentShader("DistanceMapShader.frag");
export const msdfTextureFragmentShader = (ctx: GameGLContext) => ctx.loadFragmentShader("MSDFTextureShader.frag");
export const simpleColorFragmentShader = (ctx: GameGLContext) => ctx.loadFragmentShader("SimpleColorShader.frag");
export const constantColorFragmentShader = (ctx: GameGLContext) => ctx.loadFragmentShader("ConstantColorShader.frag");

export const mapFontData = async (ctx: GameGLContext) => await GameFont.fromRaw(ctx, "../../../resources/themes/overpass-regular.png", "../../../resources/themes/overpass-regular.json");