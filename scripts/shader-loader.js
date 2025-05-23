const {readFileSync} = require("fs");
const {LazyWriter} = require("../build/src/util/LazyWriter");
const path = require("path");

module.exports = async function (shader) {
	return shader
		.replace(/load(Vertex|Fragment)Shader\("([^"]+)"\);/g, (_, type, file) => `load${type}Shader(\`${readFileSync(path.resolve(__dirname, "./../src/renderer/shader/", file))}\`);`)
		.replace(/GameFont\.fromRaw\(ctx, *"([^"]+)", *"([^"]+)"\)/g, (_, image, data) => `GameFont.fromRaw(ctx, \`data:image/png;base64,${Buffer.from(readFileSync("src/renderer/font/" + image)).toString("base64")}\`, "${encodeFontData(JSON.parse(readFileSync(path.resolve(__dirname, "./../src/renderer/font/", data))))}")`);
}

function encodeFontData(data) {
	const writer = new LazyWriter();
	writer.writeBits(16, data["chars"].length);
	for (const char of data["chars"]) {
		writer.writeBits(16, char["id"]);
		writer.writeBits(12, char["x"]);
		writer.writeBits(12, char["y"]);
		writer.writeBits(8, char["xoffset"] + 128);
		writer.writeBits(8, char["yoffset"] + 128);
		writer.writeBits(8, char["xadvance"]);
		writer.writeBits(8, char["width"]);
		writer.writeBits(8, char["height"]);
		const kernings = data["kernings"].filter(k => k["first"] === char["id"]);
		writer.writeBits(16, kernings.length);
		for (const kern of kernings) {
			writer.writeBits(16, kern["second"]);
			writer.writeBits(8, kern["amount"] + 128);
		}
	}
	writer.writeBits(8, data["common"]["lineHeight"]);
	return Buffer.from(writer.compress()).toString("base64");
}