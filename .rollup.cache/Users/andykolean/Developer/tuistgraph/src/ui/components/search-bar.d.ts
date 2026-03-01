/**
 * SearchBar Lit Component - Mission Control Theme
 *
 * Input field for filtering nodes by name/text search.
 * Features sharp edges, dramatic focus glow, and animated icon.
 *
 * @example
 * ```html
 * <xcode-graph-search-bar
 *   search-query="React"
 * ></xcode-graph-search-bar>
 * ```
 *
 * @fires search-change - Dispatched when search query changes (detail: { query: string })
 * @fires search-clear - Dispatched when clear button is clicked or Escape is pressed
 */
import { KeyboardShortcutController } from '@shared/controllers/keyboard-shortcut.controller';
import { type CSSResultGroup, LitElement, type TemplateResult } from 'lit';
import './icon-button.js';
/**
 * Input field for filtering nodes by name/text search.
 * Features sharp edges, dramatic focus glow, and animated icon.
 *
 * @summary Search input for filtering nodes
 * @fires search-change - Dispatched when the search query changes (detail: { query: string })
 * @fires search-clear - Dispatched when the clear button is clicked or Escape is pressed
 */
export declare class GraphSearchBar extends LitElement {
    /**
     * The current search query
     */
    searchQuery: string;
    private inputElement;
    static readonly styles: CSSResultGroup;
    readonly shortcut: KeyboardShortcutController;
    private handleInput;
    private handleClear;
    private handleKeyDown;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-search-bar': GraphSearchBar;
    }
}
