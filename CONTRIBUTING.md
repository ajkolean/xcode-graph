# Contributing to xcode-graph

Thank you for your interest in contributing! This guide will help you get started.

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [pnpm](https://pnpm.io/) (v10+)

## Development Setup

```bash
# Clone your fork
git clone https://github.com/<your-username>/xcode-graph.git
cd xcode-graph

# Install dependencies
pnpm install

# Start the dev server
pnpm dev
```

## Available Commands

| Command              | Description                              |
| -------------------- | ---------------------------------------- |
| `pnpm dev`           | Start the Vite dev server                |
| `pnpm build`         | Build the production bundle              |
| `pnpm build:lib`     | Build the library bundle for publishing  |
| `pnpm test:run`      | Run unit tests (Vitest)                  |
| `pnpm test:coverage` | Run tests with V8 coverage               |
| `pnpm check`         | Run Biome check (lint + format)          |
| `pnpm lint`          | Run Biome lint                           |
| `pnpm format`        | Run Biome format                         |
| `pnpm analyze`       | Regenerate Custom Elements Manifest      |
| `pnpm docs:dev`      | Start docs dev server (port 5174)        |
| `pnpm docs:api`      | Generate TypeDoc API reference           |
| `pnpm size`          | Check bundle size limits                 |
| `pnpm size:why`      | Analyze bundle composition               |
| `pnpm knip`          | Check for unused dependencies and exports|

## Submitting a Pull Request

1. **Fork** the repository and create a branch from `main`.
2. **Make your changes** and add tests if applicable.
3. **Run checks** before submitting:
   ```bash
   pnpm check
   pnpm test:run
   ```
4. **Open a pull request** with a clear description of what you changed and why.

## Code Conventions

### Components

This project uses [Lit](https://lit.dev/) web components (not React).

- **Tag prefix**: `xcode-graph-` (e.g., `<xcode-graph-sidebar>`)
- **Class naming**: `GraphComponentName`
- **File naming**: `component-name.ts` with tests in `component-name.test.ts`
- **Location**: Components live in `src/components/` or `src/graph/components/`

### Path Aliases

- `@/` maps to `src/`
- `@graph/` maps to `src/graph/*`
- `@ui/` maps to `src/ui/*`
- `@shared/` maps to `src/shared/*`

### Formatting

This project uses [Biome](https://biomejs.dev/) for linting and formatting. Run `pnpm check` to verify your code conforms. Do not use ESLint or Prettier.

### Schemas

Data validation uses [Zod](https://zod.dev/) schemas. See `src/shared/schemas/` for examples.

## Reporting Bugs

Open a [GitHub issue](https://github.com/ajkolean/xcode-graph/issues) with:

- A clear description of the bug
- Steps to reproduce
- Expected vs. actual behavior
- Browser/environment info if relevant

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
