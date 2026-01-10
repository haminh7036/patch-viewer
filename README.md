# Simple Git Patch Viewer

A small web app to preview Git-style patch/diff files in the browser. It parses .patch/.diff content and renders file trees and unified/split diff views.

## Features
- Parse and display multi-file patch (.patch, .diff)
- File tree with expand/collapse and file selection
- Unified and split diff views
- Keyboard & mobile-friendly interactions
- Playwright E2E tests and automated test runner

## Quick start

1. Install dependencies
```sh
npm install
```

2. Run the dev server
```sh
npm run dev
# open http://127.0.0.1:5173
```

3. Run the automated test sequence (starts dev server, installs Playwright browsers, runs tests)
```sh
npm run test
```
(See the test runner: [tests/run-test.js](tests/run-test.js) and Playwright config: [playwright.config.ts](playwright.config.ts))

## Usage
- Upload a `.patch` / `.diff` file via the Upload button or paste content.
- The app uses [`parsePatch`](src/utils/patchParser.js) to convert patch text into file and chunk objects.
- Select files from the sidebar to jump to the corresponding diff segment.

## Project layout (selected)
- src/App.vue — main UI and interactions ([src/App.vue](src/App.vue))
- src/components/FileTree.vue — file tree component
- src/utils/patchParser.js — patch parsing logic (`parsePatch`) ([src/utils/patchParser.js](src/utils/patchParser.js))
- tests/ — Playwright tests and runner ([tests/run-test.js](tests/run-test.js))

## Testing
- End-to-end tests use Playwright. Run:
```sh
npx playwright test
```
or use the helper:
```sh
npm run test
```

## Contributing
- Fork and send PRs. Keep changes small and add tests where appropriate.
- Update documentation when adding features.

## License
MIT — see [LICENSE](LICENSE)

## Languages
*   [English (English)](README.md)
*   [Tiếng Việt (Vietnamese)](README_vi.md)
