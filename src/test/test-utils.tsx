import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import userEvent from '@testing-library/user-event';

// Add any providers that wrap the app here
interface ProvidersProps {
  children: ReactNode;
}

function Providers({ children }: ProvidersProps) {
  return <>{children}</>;
}

// Custom render function that wraps components with providers
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Providers, ...options }),
  };
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render with custom render
export { customRender as render };

// Export userEvent for convenience
export { userEvent };
