import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    extends: './vitest.config.ts',
    test: {
      name: 'unit',
      environment: 'jsdom',
      include: [
        'src/services/*.test.ts',
        'src/shared/schemas/*.test.ts',
        'src/shared/signals/*.test.ts',
        'src/shared/controllers/*.test.ts',
        'src/graph/signals/*.test.ts',
        'src/graph/utils/*.test.ts',
        'src/graph/layout/*.test.ts',
        'src/graph/controllers/*.test.ts',
      ],
    },
  },
  {
    extends: './vitest.config.ts',
    test: {
      name: 'component',
      browser: {
        enabled: true,
        provider: 'playwright',
        instances: [{ browser: 'chromium' }],
      },
      include: [
        'src/ui/components/*.test.ts',
        'src/ui/layout/*.test.ts',
      ],
    },
  },
]);
