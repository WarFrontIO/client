const {readFileSync} = require("fs");

module.exports = async function (shader) {
	return shader.replace(/load(Vertex|Fragment)Shader\("([^"]+)"\);/g, (_, type, file) => `load${type}Shader(\`${readFileSync("src/renderer/shader/" + file)}\`);`);
}