# Samual's Rolldown Config
An opinionated Rolldown config.

Requires Node.js 20.10+, 22.0+, or above.

## Install
```sh
npm install @samual/cookie
```

## Usage
Put this in your `rolldown.config.js`:
```js
import { rolldownConfig } from "@samual/rolldown-config"

export default rolldownConfig()
```

By default, this config finds source files in `src` and emits them to `dist`.
You can override the source path with `rolldownConfig({ sourcePath: "source" })` and you can override the out path with
`rolldownConfig({ rolldownOptions: { output: { dir: "build" } } })`.
