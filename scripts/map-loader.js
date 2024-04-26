const {encodeMap} = require("../build/MapCodec");
const {readdirSync, readFileSync} = require("fs");

const sharp = require("sharp");

module.exports = async function (map) {
	if (map.includes("// BUILD_MAPS_REGISTER")) {
		console.log("Registering build maps...");

		let maps = [];
		for (const file of readdirSync("resources/maps")) {
			if (!file.endsWith(".png")) continue;

			const name = file.replace(".png", "");

			const image = await sharp("resources/maps/" + file).ensureAlpha().raw().toBuffer({resolveWithObject: true});

			const config = {tiles: ["#0000FF", "#00FF00"]};
			try {
				const options = JSON.parse(readFileSync("resources/maps/" + name + ".json", "utf8"));
				for (const key in options) {
					config[key] = options[key];
				}
			} catch (e) {
				// Use default config
			}

			const tiles = new Uint16Array(image.info.width * image.info.height);
			for (let i = 0; i < image.data.length; i += 4) {
				let closest = 0, closestDistance = Infinity;
				for (let j = 0; j < config.tiles.length; j++) {
					if (!config.tiles[j].startsWith("#")) continue;
					const tileRGB = parseInt(config.tiles[j].slice(1), 16);
					const distance = Math.sqrt(Math.pow(image.data[i] - ((tileRGB >> 16) & 0xFF), 2) + Math.pow(image.data[i + 1] - ((tileRGB >> 8) & 0xFF), 2) + Math.pow(image.data[i + 2] - (tileRGB & 0xFF), 2));
					if (distance < closestDistance) {
						closest = j;
						closestDistance = distance;
					}
				}
				tiles[i / 4] = closest;
			}

			const raw = {width: image.info.width, height: image.info.height, tiles: tiles};
			const encoded = encodeMap(raw);
			maps.push({
				name: name,
				data: encoded
			});
			console.log(`Registered map ${name} [${Math.round(encoded.length / 1024 * 10) / 10} KB]`);
		}

		map = map.replace(/\/\/ BUILD_MAPS_REGISTER/, maps.map(m => `registerMap("${m.name}", "${Buffer.from(m.data).toString("base64")}");`).join("\n"));
	}
	return map;
}