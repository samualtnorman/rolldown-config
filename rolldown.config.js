#!node_modules/.bin/rolldown --config
import Path from "path"
import { rolldownConfig } from "./node_modules/@samual/rolldown-config/default.js"

export default rolldownConfig(
	process.env.JSR
		? {
			rolldownOptions: { output: { banner: (/** @type {import("rolldown").AddonFunction} */ chunk) => `// @ts-self-types="./${Path.basename(chunk.name)}.d.ts"` } },
			terserOptions: { format: { comments: /@ts-self-types/ } }
		}
		: undefined
)
