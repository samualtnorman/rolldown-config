#!/usr/bin/env node
import { expect } from "@samual/assert"
import { spawnSync } from "child_process"
import * as Semver from "semver"
import packageJson from "../package.json" with { type: "json" }

const hash = spawnSync("git", [ "rev-parse", "--short", "HEAD" ], { encoding: "utf8" }).stdout.trim()

spawnSync("pnpm", [ "version", `${expect(Semver.inc(packageJson.version, "patch"))}-${hash}` ], { stdio: "inherit" })
process.exit()
