const {Compilation, sources} = require("webpack");

class SourceMapFixer {
	apply(compiler) {
		compiler.hooks.compilation.tap("SourceMapFixer", (compilation) => {
			compilation.hooks.processAssets.tap({
				name: "SourceMapFixer",
				stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE
			}, (assets) => {
				console.log("Fixing source maps...");
				for (const file in assets) {
					console.log(file);
					if (file === "main.js.map") {
						compilation.updateAsset(file, new sources.RawSource(JSON.stringify({
							version: 3,
							file: "index.html",
							sections: [
								{
									offset: {
										line: 1,
										column: 0
									},
									map: JSON.parse(assets[file].source())
								}
							]
						})));
					}
					if (file === "index.html") {
						compilation.updateAsset(file, new sources.RawSource(assets[file].source().replace("<script defer=\"defer\">", "<script defer=\"defer\">\n")));
					}
				}
			});
		});
	}
}

module.exports = SourceMapFixer;