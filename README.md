# Simple Git Patch Viewer

<img src="public/ico.svg" alt="Patch Viewer icon" width="64" height="64" />

A lightweight, browser-based viewer for Git patch and diff files. Parse, visualize, and analyze multi-file patches with support for multiple view modes, real-time search, and comprehensive filtering.

## Overview

**Patch Viewer** makes it easy to review and understand Git patches directly in your browser. Whether you're reviewing code changes, analyzing diffs, or sharing patch details, this tool provides an intuitive interface with powerful features for inspection.

## Key Features

- **Multi-file Patch Support** — Parse and display `.patch` and `.diff` files with multiple file changes
- **Dual View Modes** — Switch between unified and split diff views for different analysis styles
- **Interactive File Tree** — Expand/collapse file structure with visual indicators for modifications
- **Smart Filtering** — Filter by file status (added, modified, deleted) to focus on relevant changes
- **Real-time Search** — Search across filenames to quickly locate specific files
- **Statistics Dashboard** — View total additions and deletions at a glance
- **Responsive Design** — Optimized for desktop and mobile browsing
- **Drag & Drop Support** — Upload patches by dragging files into the browser
- **Pagination** — Handle large patch files with automatic pagination
- **Smart Heuristics** — Detects and handles generated files, lock files, and minified code

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

```sh
npm install
```

### Running the Development Server

```sh
npm run dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173) in your browser to start using the viewer.

### Building for Production

```sh
npm run build
```

The optimized build will be generated in the `dist/` directory.

## Usage

### Loading a Patch

1. Click the **Upload** button to select a `.patch` or `.diff` file from your computer
2. Alternatively, paste patch content directly into the text area
3. The viewer automatically parses and displays the patch

### Navigating Changes

- **File Tree** — Browse the file structure in the left sidebar
  - Click files to jump to their diff sections
  - Use expand/collapse arrows to organize nested directories
  
- **Filtering** — Use the sidebar controls to show/hide:
  - Added files
  - Modified files
  - Deleted files

- **Search** — Type in the search box to filter files by name

- **View Modes** — Switch between:
  - **Unified** — Traditional side-by-side diff view
  - **Split** — Separate columns for before/after

## Technology Stack

- **Frontend Framework** — Vue 3 with Composition API
- **Styling** — Tailwind CSS with PostCSS
- **Build Tool** — Vite
- **Testing** — Playwright
- **Routing** — Vue Router
- **Icons** — Lucide Vue
- **Analytics** — Vercel Analytics & Speed Insights

## Project Structure

```
src/
├── App.vue                 # Main application component
├── components/
│   ├── DiffFile.vue       # Individual file diff viewer
│   ├── FileTree.vue       # Hierarchical file browser
│   ├── EmptyState.vue     # Initial upload state
│   ├── TheHeader.vue      # App header with controls
│   ├── TheSidebar.vue     # Filter and search sidebar
│   ├── ThePagination.vue  # Page navigation
│   └── TheFooter.vue      # App footer
├── utils/
│   ├── patchParser.js     # Core patch parsing logic
│   └── uiHelpers.js       # UI utility functions
└── workers/
    └── patch.worker.js    # Web Worker for async parsing

tests/
├── filetree.spec.ts       # File tree component tests
├── mobile.spec.ts         # Mobile responsiveness tests
└── run-test.js            # Automated test runner
```

## Testing

### Run E2E Tests

```sh
npx playwright test
```

### Run Automated Test Sequence

```sh
npm run test
```

This command starts the development server, installs Playwright browsers (if needed), and runs all tests.

> **Tip:** Check [playwright.config.ts](playwright.config.ts) to customize test behavior.

## Performance & Features

- **Smart Parsing** — Efficient chunk-based diff processing
- **Split View Alignment** — Automatic line alignment in split diff mode
- **Generated File Detection** — Automatically identifies and highlights:
  - Build artifacts (`dist/`, `build/`)
  - Lock files (`package-lock.json`, `yarn.lock`, etc.)
  - Minified files (`.min.js`, `.min.css`)
  - Source maps
  - Dependencies (`node_modules/`)
  
- **Incremental Rendering** — Pagination prevents performance degradation with large patches
- **Worker Thread Support** — Background parsing via Web Workers

## Browser Support

Works on all modern browsers that support ES2022 and Vue 3:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Analytics

The app includes optional analytics:
- **Vercel Analytics** — Basic usage insights
- **Speed Insights** — Core Web Vitals monitoring

These are optional and respect user privacy preferences.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with tests
4. Commit with clear messages
5. Push and open a Pull Request

Guidelines:
- Keep changes focused and atomic
- Add tests for new features
- Update documentation as needed
- Follow existing code style

## License

MIT License — see [LICENSE](LICENSE) for details

---

## Available in Multiple Languages

- [English](README.md)
- [Tiếng Việt (Vietnamese)](README_vi.md)
