---
title: Troubleshooting
---

# Troubleshooting

## OffscreenCanvas error in tests

**Problem:** When using jsdom with Vitest, you see errors about `OffscreenCanvas` not being defined.

**Solution:** Stub `OffscreenCanvas` globally in your test setup file:

```ts
// vitest.setup.ts
if (typeof globalThis.OffscreenCanvas === 'undefined') {
  globalThis.OffscreenCanvas = class OffscreenCanvas {
    width: number;
    height: number;
    constructor(width: number, height: number) {
      this.width = width;
      this.height = height;
    }
    getContext() { return null; }
    convertToBlob() { return Promise.resolve(new Blob()); }
    transferToImageBitmap() { return {} as ImageBitmap; }
  } as unknown as typeof OffscreenCanvas;
}
```

## Large graph performance

**Problem:** The component is slow or unresponsive with hundreds of nodes.

**Tips:**
- Use the built-in filters to reduce the number of visible nodes
- Lower layout iterations via `configOverrides.iterations` for faster initial rendering
- Consider hiding edge labels for dense graphs
- Group nodes by project to reduce visual complexity

```js
graph.layoutOptions = {
  configOverrides: {
    iterations: 20, // default is higher; lower = faster but less optimized layout
  },
};
```

## Theme overrides not applying

**Problem:** CSS custom properties set in a stylesheet are not taking effect.

**Solution:** CSS custom properties must be set on the `<xcode-graph>` element or an ancestor element. Shadow DOM encapsulation prevents internal styles from leaking out, but custom properties *do* inherit through the shadow boundary.

```css
/* This works -- set on the element or ancestor */
xcode-graph {
  --graph-accent: #58a6ff;
}

/* This also works -- set on a parent */
.graph-container {
  --graph-accent: #58a6ff;
}
```

Make sure you are using the `--graph-*` property names. Internal `--colors-*` tokens are not part of the public API.

## Component not rendering

**Problem:** The `<xcode-graph>` element appears in the DOM but nothing is visible.

**Checklist:**
1. Ensure the ES module import is correct:
   ```js
   import 'xcode-graph';
   ```
2. Verify the custom element is registered:
   ```js
   console.log(customElements.get('xcode-graph')); // should not be undefined
   ```
3. Make sure the element has dimensions -- it needs explicit width/height or a sized parent:
   ```css
   xcode-graph { display: block; width: 100%; height: 100vh; }
   ```

## File upload not working

**Problem:** No upload button or drag-and-drop area is visible.

**Solution:** You must set the `show-upload` attribute:

```html
<xcode-graph show-upload></xcode-graph>
```

Without this attribute, the upload UI is hidden by default so the component can be used in embedded contexts where upload is not needed.

## Color scheme not changing

**Problem:** Setting a `theme` attribute does not switch between light and dark mode.

**Solution:** Use the `color-scheme` attribute (not `theme`):

```html
<xcode-graph color-scheme="light"></xcode-graph>
<xcode-graph color-scheme="dark"></xcode-graph>
<xcode-graph color-scheme="auto"></xcode-graph> <!-- follows system preference -->
```

Or set it programmatically:

```js
const graph = document.querySelector('xcode-graph');
graph.colorScheme = 'light';
```
