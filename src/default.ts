import { parseAsync, traverse } from "@babel/core"
import babelPluginSyntaxTypescript from "@babel/plugin-syntax-typescript"
import babelPresetEnv, { Options as BabelPresetEnvOptions } from "@babel/preset-env"
import babelPresetTypescript from "@babel/preset-typescript"
import { babel, type RollupBabelInputPluginOptions } from "@rollup/plugin-babel"
import terser, { type Options as TerserOptions } from "@rollup/plugin-terser"
import { expect } from "@samual/assert"
import prettier, { type Options as PrettierOptions } from "@samual/rolldown-plugin-prettier"
import type { LaxPartial } from "@samual/types"
import { babelPluginHere } from "babel-plugin-here"
import { babelPluginVitest } from "babel-plugin-vitest"
import { defu } from "defu"
import type { Dirent } from "fs"
import { readdir as readFolder } from "fs/promises"
import { cpus } from "os"
import * as Path from "path"
import type { RolldownOptions } from "rolldown"

type Options = LaxPartial<{
	/**
	 * Override the source folder.
	 * @default "src"
	 *
	 * @example
	 * ```js
	 * // rolldown.config.js
	 * import { rolldownConfig } from "@samual/rolldown-config"
	 *
	 * export default rolldownConfig({ sourcePath: "source" })
	 * ```
	 */
	sourcePath: string

	/**
	 * Override any Rolldown options.
	 * @see [Official Rolldown docs.](https://rolldown.rs/reference/config-options)
	 *
	 * @example
	 * ```ts
	 * // rolldown.config.js
	 * import { rolldownConfig } from "@samual/rolldown-config"
	 *
	 * // You can override the output folder like so:
	 * export default rolldownConfig({ rolldownOptions: { output: { dir: "build" } } })
	 * ```
	 */
	rolldownOptions: RolldownOptions

	/**
	 * Override any Babel options.
	 * @see [Official Babel docs.](https://babeljs.io/docs/options)
	 */
	babelOptions: RollupBabelInputPluginOptions

	/**
	 * Override any Terser options.
	 * @see [Official Terser docs.](https://terser.org/docs/options/)
	 */
	terserOptions: TerserOptions

	/**
	 * Override any Prettier options.
	 * @see [Official Prettier docs.](https://prettier.io/docs/en/options)
	 */
	prettierOptions: PrettierOptions

	experimental: LaxPartial<{ noSideEffects: boolean, disablePrettier: boolean }>
}>

const getDirentParentPath = (dirent: Dirent): string => (dirent as any).parentPath ?? dirent.path

/**
 * Construct a {@linkcode RollupOptions} object.
 *
 * Compiles all `.js` and `.ts` files (excludes `.test.js`, `.test.ts`, and `.d.ts`) found in the
 * {@linkcode Options.sourcePath sourcePath}.
 *
 * @see {@linkcode Options}
 *
 * @example
 * ```text
 * src/
 * 	env.d.ts
 * 	foo.ts
 * 	bar/
 * 		baz.ts
 * 		baz.test.ts
 * dist/
 * 	foo.js
 * 	bar/
 * 		baz.js
 * ```
 *
 * @example
 * ```js
 * // rolldown.config.js
 * import { rolldownConfig } from "@samual/rolldown-config"
 *
 * export default rolldownConfig()
 * ```
 */
export const rolldownConfig = async ({
	sourcePath = "src",
	rolldownOptions,
	babelOptions,
	terserOptions,
	prettierOptions,
	experimental
}: Options = {}): Promise<RolldownOptions> => defu(rolldownOptions, {
	external: source => !(Path.isAbsolute(source) || source.startsWith(".")),
	input: Object.fromEntries(
		(await readFolder(sourcePath, { withFileTypes: true, recursive: true }))
			.filter(dirent => dirent.isFile())
			.map(dirent => Path.join(getDirentParentPath(dirent), dirent.name))
			.filter(path =>
				(path.endsWith(".js") && !path.endsWith(".test.js")) ||
				(path.endsWith(".ts") && !path.endsWith(".d.ts") && !path.endsWith(".test.ts"))
			)
			.map(path => [ path.slice(sourcePath.length + 1, -3), path ])
	),
	output: { dir: `dist` },
	plugins: [
		babel(defu(babelOptions, {
			babelHelpers: "bundled",
			extensions: [ ".ts" ],
			presets: [
				[
					babelPresetEnv,
					{ targets: { node: "20.10" } } satisfies BabelPresetEnvOptions
				],
				[ babelPresetTypescript, { allowDeclareFields: true, optimizeConstEnums: true } ]
			],
			plugins: [ babelPluginHere(), babelPluginVitest() ]
		} satisfies RollupBabelInputPluginOptions)),
		terser(defu(terserOptions, {
			compress: { passes: Infinity, unsafe: true, sequences: false, keep_infinity: true },
			maxWorkers: Math.floor(cpus().length / 2),
			mangle: false,
			ecma: 2020
		} satisfies TerserOptions)),
		experimental?.noSideEffects && {
			name: `no-side-effects`,
			async renderChunk(code) {
				const ast = expect(await parseAsync(code, { plugins: [ babelPluginSyntaxTypescript ] }))
				const indexes: number[] = []

				traverse(ast, {
					Function(path) {
						if (
							path.node.loc &&
							!path.node.type.endsWith(`Method`) &&
							(!path.isExpression() || path.parentPath.node.type == `VariableDeclarator`) &&
							path.isPure()
						)
							indexes.push(path.node.loc.start.index)
					}
				})

				indexes.sort((a, b) => b - a)

				for (const index of indexes)
					code = `${code.slice(0, index)}/*@__NO_SIDE_EFFECTS__*/${code.slice(index)}`

				return code
			}
		},
		experimental?.disablePrettier ? undefined : prettier(defu(prettierOptions, {
			parser: "espree",
			useTabs: true,
			tabWidth: 4,
			arrowParens: "avoid",
			printWidth: 120,
			semi: false,
			trailingComma: "none"
		} satisfies PrettierOptions))
	],
	preserveEntrySignatures: "strict",
	treeshake: { moduleSideEffects: false }
} satisfies RolldownOptions)
