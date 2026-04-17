#!/usr/bin/env node
import { expect } from "@samual/assert"
import { spawnSync } from "child_process"
import { readFileSync } from "fs"
import * as Semver from "semver"
import packageJson from "../package.json" with { type: "json" }

const hash = spawnSync("git", [ "rev-parse", "--short", "HEAD" ], {
	encoding: "utf8",
	stdio: [ `ignore`, `pipe`, `inherit` ]
}).stdout.trim()

spawnSync("pnpm", [ "version", `${expect(Semver.inc(packageJson.version, "patch"))}-${hash}` ], { stdio: "inherit" })

const newVersion = /** @type {Record<string, unknown> | null} */
	(JSON.parse(readFileSync(`package.json`, { encoding: `utf8` })))?.version

if (packageJson.version == newVersion) {
	console.error(`Version didn't change`)
	process.exit(1)
}

process.exit()
