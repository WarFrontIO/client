import {GameGLContext} from "../GameGLContext";

// Shaders are inlined by the build process
export const compositeVertexShader = (ctx: GameGLContext) => ctx.loadVertexShader("CompositeShader.vert");
export const flippedTextureVertexShader = (ctx: GameGLContext) => ctx.loadVertexShader("FlippedTextureShader.vert");
export const mapGridLookupVertexShader = (ctx: GameGLContext) => ctx.loadVertexShader("MapGridLookupShader.vert");

export const simpleTextureFragmentShader = (ctx: GameGLContext) => ctx.loadFragmentShader("SimpleTextureShader.frag");
export const mapRenderingFragmentShader = (ctx: GameGLContext) => ctx.loadFragmentShader("MapRenderingShader.frag");
export const territoryRenderingFragmentShader = (ctx: GameGLContext) => ctx.loadFragmentShader("TerritoryRenderingShader.frag");
export const distanceMapFragmentShader = (ctx: GameGLContext) => ctx.loadFragmentShader("DistanceMapShader.frag");