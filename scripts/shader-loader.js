const {readFileSync} = require("fs");

module.exports = async function (shader) {
	return shader
		.replace(/load(Vertex|Fragment)Shader\("([^"]+)"\);/g, (_, type, file) => `load${type}Shader(\`${readFileSync("src/renderer/shader/" + file)}\`);`)
		.replace(/GameFont\.fromRaw\(ctx, *"([^"]+)", *"([^"]+)"\)/g, (_, image, data) => `GameFont.fromRaw(ctx, \`data:image/png;base64,${Buffer.from(readFileSync("src/renderer/font/" + image)).toString("base64")}\`, ${readFileSync("src/renderer/font/" + data)})`);
}