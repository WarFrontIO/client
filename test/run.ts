import {readdirSync, statSync} from "fs"
import {run} from "node:test"
import {spec} from "node:test/reporters"

function searchTests(path: string): string[] {
	return readdirSync(path).filter((file) => file.endsWith('.test.ts')).map((file) => `${path}/${file}`)
		.concat(readdirSync(path).filter((file) => statSync(`${path}/${file}`).isDirectory()).map((dir) => searchTests(`${path}/${dir}`)).flat());
}

run({
	files: searchTests(__dirname),
	concurrency: true
}).once("test:fail", () => process.exitCode = 1)
	.compose(new spec()).pipe(process.stdout);