# Chromatic Testing Guidelines

## Shadow DOM Components

Always use `waitForLitElements()` before interactions:

```typescript
import { waitForLitElements } from './utils/storybook-helpers';

play: async ({ canvasElement }) => {
  await waitForLitElements(canvasElement);
  // Now safe to interact with Lit components
}
```

## Delay Configuration

Global 1000ms delay ensures Shadow DOM hydration.
Increase per-story if needed:

```typescript
parameters: {
  chromatic: { delay: 2000 }
}
```

## Modes Testing

All stories automatically test in light + dark modes.
Disable per-story with:

```typescript
parameters: {
  chromatic: { modes: { light: { disable: true } } }
}
```
