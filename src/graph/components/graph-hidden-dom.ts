/**
 * Hidden DOM for Canvas Accessibility
 *
 * Provides a screen-reader accessible representation of the graph
 * that is visually hidden but navigable via keyboard.
 * Uses roving tabindex for efficient keyboard navigation.
 *
 * @fires node-select - Dispatched when a node is activated (detail: { node })
 */

import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import { type CSSResultGroup, css, html, LitElement, type PropertyValues, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';

export class GraphHiddenDom extends LitElement {
  @property({ attribute: false })
  declare nodes: GraphNode[];

  @property({ attribute: false })
  declare edges: GraphEdge[];

  @property({ attribute: false })
  declare selectedNode: GraphNode | null;

  /** Index of the currently focused node in the list (roving tabindex) */
  @state()
  private declare focusedIndex: number;

  constructor() {
    super();
    this.nodes = [];
    this.edges = [];
    this.selectedNode = null;
    this.focusedIndex = 0;
  }

  static override styles: CSSResultGroup = css`
    :host {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `;

  override willUpdate(changedProps: PropertyValues<this>): void {
    if (changedProps.has('nodes')) {
      // Reset focus index if nodes change
      this.focusedIndex = 0;
    }
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (this.nodes.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight': {
        e.preventDefault();
        this.focusedIndex = (this.focusedIndex + 1) % this.nodes.length;
        this.focusCurrentNode();
        break;
      }
      case 'ArrowUp':
      case 'ArrowLeft': {
        e.preventDefault();
        this.focusedIndex = (this.focusedIndex - 1 + this.nodes.length) % this.nodes.length;
        this.focusCurrentNode();
        break;
      }
      case 'Home': {
        e.preventDefault();
        this.focusedIndex = 0;
        this.focusCurrentNode();
        break;
      }
      case 'End': {
        e.preventDefault();
        this.focusedIndex = this.nodes.length - 1;
        this.focusCurrentNode();
        break;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        const node = this.nodes[this.focusedIndex];
        if (node) {
          const newSelection = this.selectedNode?.id === node.id ? null : node;
          this.dispatchEvent(
            new CustomEvent('node-select', {
              detail: { node: newSelection },
              bubbles: true,
              composed: true,
            }),
          );
        }
        break;
      }
    }
  }

  private focusCurrentNode() {
    const items = this.shadowRoot?.querySelectorAll('[role="treeitem"]');
    const target = items?.[this.focusedIndex] as HTMLElement | undefined;
    target?.focus();
  }

  private getNodeDescription(node: GraphNode): string {
    const deps = this.edges.filter((e) => e.source === node.id).length;
    const dependents = this.edges.filter((e) => e.target === node.id).length;
    const parts: string[] = [node.type];
    if (node.platform) parts.push(`platform ${node.platform}`);
    if (node.project) parts.push(`project ${node.project}`);
    parts.push(`${deps} dependencies`);
    parts.push(`${dependents} dependents`);
    return parts.join(', ');
  }

  override render(): TemplateResult {
    const nodeCount = this.nodes.length;
    const edgeCount = this.edges.length;

    return html`
      <div role="region" aria-label="Graph navigation">
        <p id="graph-summary">
          Dependency graph with ${nodeCount} nodes and ${edgeCount} edges.
          ${this.selectedNode ? `Selected: ${this.selectedNode.name}.` : ''}
          Use arrow keys to navigate nodes, Enter to select.
        </p>

        <div
          role="tree"
          aria-label="Graph nodes"
          aria-describedby="graph-summary"
          @keydown=${this.handleKeyDown}
        >
          ${repeat(
            this.nodes,
            (node) => node.id,
            (node, i) => html`
              <div
                role="treeitem"
                tabindex=${i === this.focusedIndex ? 0 : -1}
                aria-selected=${this.selectedNode?.id === node.id}
                aria-label="${node.name}, ${this.getNodeDescription(node)}"
              >
                ${node.name}
              </div>
            `,
          )}
        </div>

        <div aria-live="polite" aria-atomic="true">
          ${this.selectedNode ? html`<p>Selected node: ${this.selectedNode.name}</p>` : ''}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xcode-graph-hidden-dom': GraphHiddenDom;
  }
}

// Register custom element with HMR support
if (!customElements.get('xcode-graph-hidden-dom')) {
  customElements.define('xcode-graph-hidden-dom', GraphHiddenDom);
}
