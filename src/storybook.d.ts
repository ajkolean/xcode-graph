/**
 * Storybook Type Declarations
 *
 * These declarations are needed because TypeScript's bundler moduleResolution
 * has difficulty resolving types from packages that use subpath exports with
 * internal dependencies (storybook/internal/types).
 *
 * See: https://github.com/storybookjs/storybook/issues/23441
 */

// Re-export types from @storybook/web-components
declare module '@storybook/web-components' {
  import type { TemplateResult, SVGTemplateResult } from 'lit';

  // Basic Args type
  type Args = Record<string, unknown>;

  // WebComponents renderer type
  type StoryFnHtmlReturnType =
    | string
    | Node
    | DocumentFragment
    | TemplateResult
    | SVGTemplateResult;

  interface WebComponentsRenderer {
    component: string;
    storyResult: StoryFnHtmlReturnType;
  }

  // ArgTypes for component documentation
  interface ArgType<TArg = unknown> {
    name?: string;
    description?: string;
    defaultValue?: TArg;
    if?: { arg?: string; exists?: boolean };
    control?:
      | false
      | {
          type: string;
          options?: readonly TArg[];
          min?: number;
          max?: number;
          step?: number;
        }
      | string;
    options?: readonly TArg[];
    mapping?: Record<string, TArg>;
    table?: {
      type?: { summary?: string; detail?: string };
      defaultValue?: { summary?: string; detail?: string };
      category?: string;
      subcategory?: string;
      disable?: boolean;
    };
  }

  type ArgTypes<TArgs = Args> = {
    [key in keyof TArgs]?: ArgType<TArgs[key]>;
  };

  // Parameters type
  type Parameters = Record<string, unknown>;

  /**
   * Metadata to configure the stories for a component.
   */
  interface Meta<TArgs = Args> {
    title?: string;
    id?: string;
    component?: string;
    subcomponents?: Record<string, string>;
    parameters?: Parameters;
    decorators?: Decorator<TArgs>[];
    loaders?: Loader<TArgs>[];
    args?: Partial<TArgs>;
    argTypes?: ArgTypes<TArgs>;
    tags?: string[];
    render?: (args: TArgs) => StoryFnHtmlReturnType;
    play?: (context: PlayFunctionContext<TArgs>) => Promise<void> | void;
  }

  /**
   * Story function that represents a CSFv2 component example.
   */
  type StoryFn<TArgs = Args> = (args: TArgs) => StoryFnHtmlReturnType;

  /**
   * Story object that represents a CSFv3 component example.
   */
  interface StoryObj<TArgs = Args> {
    name?: string;
    args?: Partial<TArgs>;
    argTypes?: ArgTypes<TArgs>;
    parameters?: Parameters;
    decorators?: Decorator<TArgs>[];
    loaders?: Loader<TArgs>[];
    tags?: string[];
    render?: (args: TArgs) => StoryFnHtmlReturnType;
    play?: (context: PlayFunctionContext<TArgs>) => Promise<void> | void;
  }

  // Decorator type
  type Decorator<TArgs = Args> = (
    storyFn: () => StoryFnHtmlReturnType,
    context: StoryContext<TArgs>,
  ) => StoryFnHtmlReturnType;

  // Loader type
  type Loader<TArgs = Args> = (context: StoryContext<TArgs>) => Promise<Record<string, unknown>>;

  // StoryContext type
  interface StoryContext<TArgs = Args> {
    args: TArgs;
    argTypes: ArgTypes<TArgs>;
    globals: Record<string, unknown>;
    parameters: Parameters;
    viewMode: 'story' | 'docs';
    loaded: Record<string, unknown>;
    step: (label: string, play: () => Promise<void> | void) => Promise<void>;
    canvasElement: HTMLElement;
    canvas: Canvas;
    id: string;
    name: string;
    title: string;
  }

  // Canvas interface for querying elements
  interface Canvas {
    getByRole(role: string, options?: { name?: string | RegExp }): HTMLElement;
    getByText(text: string | RegExp): HTMLElement;
    getByLabelText(text: string | RegExp): HTMLElement;
    getByTestId(testId: string): HTMLElement;
    queryByRole(role: string, options?: { name?: string | RegExp }): HTMLElement | null;
    queryByText(text: string | RegExp): HTMLElement | null;
    findByRole(role: string, options?: { name?: string | RegExp }): Promise<HTMLElement>;
    findByText(text: string | RegExp): Promise<HTMLElement>;
    findAllByRole(role: string, options?: { name?: string | RegExp }): Promise<HTMLElement[]>;
    // Shadow DOM queries
    findByShadowText(text: string): Promise<HTMLElement>;
    findByShadowRole(role: string, options?: { name?: string | RegExp }): Promise<HTMLElement>;
    findAllByShadowRole(role: string, options?: { name?: string | RegExp }): Promise<HTMLElement[]>;
    queryByShadowText(text: string): HTMLElement | null;
    queryByShadowRole(role: string, options?: { name?: string | RegExp }): HTMLElement | null;
  }

  // PlayFunctionContext type
  interface PlayFunctionContext<TArgs = Args> extends StoryContext<TArgs> {}

  // Preview type
  interface Preview {
    decorators?: Decorator[];
    parameters?: Parameters;
    globalTypes?: Record<string, unknown>;
    loaders?: Loader[];
  }

  export type {
    Args,
    ArgType,
    ArgTypes,
    Canvas,
    Decorator,
    Loader,
    Meta,
    Parameters,
    PlayFunctionContext,
    Preview,
    StoryContext,
    StoryFn,
    StoryFnHtmlReturnType,
    StoryObj,
    WebComponentsRenderer,
  };
}

// Re-export types from storybook/test
declare module 'storybook/test' {
  // Expect assertion
  interface Assertion<T> {
    toBe(expected: T): Promise<void>;
    toEqual(expected: T): Promise<void>;
    toBeTruthy(): Promise<void>;
    toBeFalsy(): Promise<void>;
    toBeNull(): Promise<void>;
    toBeUndefined(): Promise<void>;
    toBeDefined(): Promise<void>;
    toBeGreaterThan(expected: number): Promise<void>;
    toBeGreaterThanOrEqual(expected: number): Promise<void>;
    toBeLessThan(expected: number): Promise<void>;
    toBeLessThanOrEqual(expected: number): Promise<void>;
    toContain(expected: unknown): Promise<void>;
    toHaveLength(expected: number): Promise<void>;
    toMatch(expected: string | RegExp): Promise<void>;
    toMatchObject(expected: Record<string, unknown>): Promise<void>;
    toHaveBeenCalled(): Promise<void>;
    toHaveBeenCalledTimes(expected: number): Promise<void>;
    toHaveBeenCalledWith(...args: unknown[]): Promise<void>;
    toThrow(expected?: string | RegExp | Error): Promise<void>;
    // Negation
    not: Assertion<T>;
    // Async
    resolves: Assertion<T>;
    rejects: Assertion<T>;
  }

  interface Expect {
    <T>(actual: T): Assertion<T>;
    anything(): unknown;
    any(constructor: new (...args: unknown[]) => unknown): unknown;
    arrayContaining<T>(expected: T[]): T[];
    objectContaining<T>(expected: Partial<T>): T;
    stringContaining(expected: string): string;
    stringMatching(expected: string | RegExp): string;
  }

  const expect: Expect;

  // UserEvent for simulating user interactions
  interface UserEvent {
    click(element: Element): Promise<void>;
    dblClick(element: Element): Promise<void>;
    tripleClick(element: Element): Promise<void>;
    hover(element: Element): Promise<void>;
    unhover(element: Element): Promise<void>;
    tab(options?: { shift?: boolean }): Promise<void>;
    keyboard(text: string): Promise<void>;
    type(element: Element, text: string, options?: { delay?: number }): Promise<void>;
    clear(element: Element): Promise<void>;
    selectOptions(
      element: Element,
      values: string | string[] | HTMLElement | HTMLElement[],
    ): Promise<void>;
    deselectOptions(
      element: Element,
      values: string | string[] | HTMLElement | HTMLElement[],
    ): Promise<void>;
    upload(element: Element, files: File | File[]): Promise<void>;
    paste(text?: string): Promise<void>;
    pointer(input: string | PointerInput | PointerInput[]): Promise<void>;
  }

  interface PointerInput {
    keys?: string;
    target?: Element;
    coords?: { x: number; y: number };
    node?: Node;
    offset?: number;
  }

  const userEvent: UserEvent;

  // Mock function types
  interface MockInstance<TArgs extends unknown[] = unknown[], TReturn = unknown> {
    (...args: TArgs): TReturn;
    mockClear(): this;
    mockReset(): this;
    mockRestore(): void;
    mockImplementation(fn: (...args: TArgs) => TReturn): this;
    mockImplementationOnce(fn: (...args: TArgs) => TReturn): this;
    mockReturnValue(value: TReturn): this;
    mockReturnValueOnce(value: TReturn): this;
    mockResolvedValue(value: Awaited<TReturn>): this;
    mockResolvedValueOnce(value: Awaited<TReturn>): this;
    mockRejectedValue(value: unknown): this;
    mockRejectedValueOnce(value: unknown): this;
    mock: {
      calls: TArgs[];
      results: { type: 'return' | 'throw'; value: TReturn | unknown }[];
      instances: unknown[];
      lastCall?: TArgs;
    };
  }

  function fn<TArgs extends unknown[] = unknown[], TReturn = unknown>(
    implementation?: (...args: TArgs) => TReturn,
  ): MockInstance<TArgs, TReturn>;

  function spyOn<T extends object, K extends keyof T>(
    object: T,
    method: K,
  ): T[K] extends (...args: infer A) => infer R ? MockInstance<A, R> : never;

  // Cleanup
  function clearAllMocks(): void;
  function resetAllMocks(): void;
  function restoreAllMocks(): void;

  // waitFor utility
  function waitFor<T>(
    callback: () => T | Promise<T>,
    options?: { timeout?: number; interval?: number },
  ): Promise<T>;

  // within utility
  function within(element: HTMLElement): {
    getByRole(role: string, options?: { name?: string | RegExp }): HTMLElement;
    getByText(text: string | RegExp): HTMLElement;
    getByLabelText(text: string | RegExp): HTMLElement;
    queryByRole(role: string, options?: { name?: string | RegExp }): HTMLElement | null;
    queryByText(text: string | RegExp): HTMLElement | null;
    findByRole(role: string, options?: { name?: string | RegExp }): Promise<HTMLElement>;
    findByText(text: string | RegExp): Promise<HTMLElement>;
  };

  // fireEvent utility
  const fireEvent: {
    click(element: Element): void;
    change(element: Element, options?: { target?: { value?: string } }): void;
    input(element: Element, options?: { target?: { value?: string } }): void;
    submit(element: Element): void;
    focus(element: Element): void;
    blur(element: Element): void;
    keyDown(element: Element, options?: { key?: string; code?: string }): void;
    keyUp(element: Element, options?: { key?: string; code?: string }): void;
    keyPress(element: Element, options?: { key?: string; code?: string }): void;
    mouseEnter(element: Element): void;
    mouseLeave(element: Element): void;
    mouseOver(element: Element): void;
    mouseOut(element: Element): void;
  };

  export {
    clearAllMocks,
    expect,
    fireEvent,
    fn,
    resetAllMocks,
    restoreAllMocks,
    spyOn,
    userEvent,
    waitFor,
    within,
  };

  export type { Assertion, Expect, MockInstance, PointerInput, UserEvent };
}
