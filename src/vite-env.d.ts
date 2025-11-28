/// <reference types="vite/client" />

// Allow CSS imports
declare module '*.css' {
  const content: string;
  export default content;
}

// Extend testing-library with Shadow DOM queries for Storybook play functions
declare module 'storybook/test' {
  export interface BoundFunctions<Q> {
    findByShadowText(text: string): Promise<HTMLElement>;
    findByShadowRole(role: string, options?: { name?: string | RegExp }): Promise<HTMLElement>;
    findAllByShadowRole(role: string, options?: { name?: string | RegExp }): Promise<HTMLElement[]>;
    queryByShadowText(text: string): HTMLElement | null;
    queryByShadowRole(role: string, options?: { name?: string | RegExp }): HTMLElement | null;
  }
}

declare module '@storybook/web-components' {
  interface PlayFunctionContext<TArgs> {
    canvas: {
      findByShadowText(text: string): Promise<HTMLElement>;
      findByShadowRole(role: string, options?: { name?: string | RegExp }): Promise<HTMLElement>;
      findAllByShadowRole(role: string, options?: { name?: string | RegExp }): Promise<HTMLElement[]>;
      queryByShadowText(text: string): HTMLElement | null;
      queryByShadowRole(role: string, options?: { name?: string | RegExp }): HTMLElement | null;
      findByRole(role: string, options?: { name?: string | RegExp }): Promise<HTMLElement>;
      findByText(text: string): Promise<HTMLElement>;
      getByRole(role: string, options?: { name?: string | RegExp }): HTMLElement;
      getByText(text: string): HTMLElement;
    };
  }
}
