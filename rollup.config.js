#!node_modules/.bin/rollup --config
import Path from "path"
import { rollupConfig } from "./node_modules/@samual/rollup-config/index.js"

export default (/** @type {Record<string, unknown>} */ args) => rollupConfig(
	args.configJsr
		? {
			rollupOptions: { output: { banner: chunk => `// @ts-self-types="./${Path.basename(chunk.name)}.d.ts"` } },
			terserOptions: { format: { comments: /@ts-self-types/ } }
		}
		: undefined
)
