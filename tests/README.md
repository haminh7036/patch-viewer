# Playwright Test Suite

This directory contains comprehensive end-to-end tests for the Patch Viewer application using Playwright.

## Test Files

### Core Functionality
- **`core-functionality.spec.ts`** - Tests for file upload, parsing, loading states, and file tree display
  - File upload via input
  - Patch parsing and display
  - Loading indicators
  - File tree structure

### View Modes
- **`view-modes.spec.ts`** - Tests for unified and split diff view modes
  - Switching between unified and split views
  - View mode persistence across navigation

### Search and Filter
- **`search-filter.spec.ts`** - Tests for search and filtering functionality
  - Search by filename
  - Filter by file status (added, modified, deleted)
  - Combined search and filter
  - No results handling

### Pagination
- **`pagination.spec.ts`** - Tests for page navigation
  - Next/Previous page navigation
  - Direct page jumping via input
  - Button states (disabled on first/last page)
  - Loading states during navigation
  - Results count display

### Drag and Drop
- **`drag-drop.spec.ts`** - Tests for drag and drop file upload
  - File upload via drag and drop
  - Drag over effects

### Empty State
- **`empty-state.spec.ts`** - Tests for initial state and paste functionality
  - Empty state display
  - Paste patch content into textarea
  - State transitions after upload

### Collapse/Expand
- **`collapse-expand.spec.ts`** - Tests for collapse/expand all functionality
  - Collapse all diff sections
  - Expand all diff sections
  - State persistence across pages
  - Individual file toggle

### File Tree
- **`filetree.spec.ts`** - Tests for file tree expand/collapse (existing)
  - Folder expand/collapse
  - Children visibility

### Mobile
- **`mobile.spec.ts`** - Tests for mobile responsiveness (existing)
  - Header visibility on mobile
  - Sidebar behavior
  - File selection

### Accessibility
- **`accessibility.spec.ts`** - Tests for accessibility and keyboard navigation
  - ARIA labels and roles
  - Keyboard navigation
  - Semantic HTML structure
  - Screen reader support
  - Focus management

## Running Tests

### Run All Tests
```bash
npx playwright test
```

### Run Specific Test File
```bash
npx playwright test core-functionality.spec.ts
```

### Run Tests in Headed Mode
```bash
npx playwright test --headed
```

### Run Tests in Debug Mode
```bash
npx playwright test --debug
```

### Run Tests with UI Mode
```bash
npx playwright test --ui
```

### Run Only Failed Tests
```bash
npx playwright test --last-failed
```

## Test Configuration

Tests use the configuration from `playwright.config.ts`:
- **Test Directory**: `./tests`
- **Timeout**: 60 seconds per test
- **Browser**: Chromium (Desktop Chrome)
- **Headless**: Yes (by default)
- **Video**: Retained on failure
- **Output**: `tests/output`
- **Report**: HTML report in `tests/playwright-report`

## Prerequisites

Before running tests, ensure:
1. Development server is running on `http://127.0.0.1:5173/`
2. `sample.patch` file exists in the project root
3. Playwright browsers are installed: `npx playwright install`

## Automated Test Runner

Use the automated test runner script:
```bash
npm run test
```

This script:
1. Starts the development server
2. Installs Playwright browsers (if needed)
3. Runs all tests
4. Generates HTML report

## Test Best Practices

These tests follow Playwright best practices:
- **User-facing locators**: Using `getByRole`, `getByText`, `getByLabel`
- **Auto-retrying assertions**: Using `await expect()`
- **Test steps**: Grouping actions with `test.step()`
- **Descriptive names**: Clear test and step titles
- **Proper waits**: Using `waitForLoadState` and `waitForTimeout` appropriately
- **Accessibility**: Testing with semantic selectors and ARIA attributes

## Viewing Test Reports

After running tests, view the HTML report:
```bash
npx playwright show-report tests/playwright-report
```

## Debugging Failed Tests

1. Run in headed mode to see the browser
2. Use `--debug` flag to step through tests
3. Check screenshots and videos in `tests/output`
4. Review the HTML report for detailed failure information

## Adding New Tests

When adding new tests:
1. Follow the existing file structure
2. Use descriptive test names
3. Group related tests in `test.describe()` blocks
4. Use `test.step()` for better reporting
5. Follow the accessibility guidelines from `.antigravity/playwright-ts.md`
6. Add proper setup in `beforeEach` hooks
7. Clean up in `afterEach` if needed

## CI/CD Integration

These tests can be integrated into CI/CD pipelines:
```yaml
- name: Install dependencies
  run: npm ci
  
- name: Install Playwright browsers
  run: npx playwright install --with-deps
  
- name: Run tests
  run: npx playwright test
  
- name: Upload test results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: tests/playwright-report
```
