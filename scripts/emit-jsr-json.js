#!/usr/bin/env node
import { mkdirSync as makeDirectorySync, writeFileSync } from "fs"
import packageJson from "../package.json" with { type: "json" }

const { name, version, license, dependencies } = packageJson

makeDirectorySync("dist", { recursive: true })

const imports =
	Object.fromEntries(Object.entries(dependencies).map(([ name, version ],) => [ name, `npm:${name}@${version}` ]))

writeFileSync("dist/jsr.json", JSON.stringify(
	{ name, version, license, exports: { ".": "./default.js" }, imports },
	undefined,
	"\t"
))

process.exit()
