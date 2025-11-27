
  # Interactive Dependency Graph Viewer

  This is a code bundle for Interactive Dependency Graph Viewer. The original project is available at https://www.figma.com/design/aH1BfmhBe02TZWbqZRsuVR/Interactive-Dependency-Graph-Viewer.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Visual Testing with Chromatic

  ### Local Testing
  ```bash
  pnpm chromatic
  ```

  ### CI/CD
  - Visual tests run automatically on PRs and main branch pushes
  - Snapshots captured in light + dark modes at 1280px desktop viewport
  - TurboSnap enabled for faster builds (only changed stories)
  - Accessibility audits included in every build

  ### Configuration
  - Workflow: `.github/workflows/chromatic.yml`
  - Modes: `.storybook/preview.ts`
  - Guidelines: `.storybook/CHROMATIC_GUIDELINES.md`
