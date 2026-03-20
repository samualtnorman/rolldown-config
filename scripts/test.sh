#!/bin/sh
set -ex
knip --no-config-hints
tsc
tsc --project src
eslint .
