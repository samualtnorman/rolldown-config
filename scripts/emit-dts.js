#!/usr/bin/env node
import { isolatedDeclarationSync } from "oxc-transform"
import { readFileSync, writeFileSync, mkdirSync as makeFolderSync } from "fs"

const TARGET = "src/default.ts"

const { code, errors } = isolatedDeclarationSync(TARGET, readFileSync(TARGET, { encoding: "utf8" }))

if (errors.length) {
	for (const error of errors)
		console.error(error)

	process.exit(1)
}

makeFolderSync("dist", { recursive: true })
writeFileSync("dist/default.d.ts", code)
process.exit()
