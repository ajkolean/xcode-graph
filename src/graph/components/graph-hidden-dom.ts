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
import { css, html, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('xcode-graph-hidden-dom')
export class GraphHiddenDom extends LitElement {
  /** All graph nodes to expose for screen reader navigation */
  @property({ attribute: false })
  declare nodes: GraphNode[];

  /** All graph edges to expose as an accessible table */
  @property({ attribute: false })
  declare edges: GraphEdge[];

  /** Currently selected node for aria-selected state */
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

  static override styles = css`
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
      default:
        break;
    }
  }

  private focusCurrentNode() {
    const items = this.shadowRoot?.querySelectorAll('[role="treeitem"]');
    const target = items?.[this.focusedIndex] as HTMLElement | undefined;
    target?.focus();
  }

  /** Get unique cluster (project) names from nodes */
  private getClusterCount(): number {
    const clusters = new Set<string>();
    for (const node of this.nodes) {
      clusters.add(node.project || 'External');
    }
    return clusters.size;
  }

  /** Get edge row IDs relevant to a node (as source or target) */
  private getEdgeIdsForNode(nodeId: string): string {
    const ids: string[] = [];
    for (let i = 0; i < this.edges.length; i++) {
      const edge = this.edges[i];
      if (edge && (edge.source === nodeId || edge.target === nodeId)) {
        ids.push(`edge-${i}`);
      }
    }
    return ids.join(' ');
  }

  private getNodeDescription(node: GraphNode): string {
    const deps = this.edges.filter((e) => e.source === node.id).length;
    const dependents = this.edges.filter((e) => e.target === node.id).length;
    const parts = [node.type];
    if (node.platform) parts.push(`platform ${node.platform}`);
    if (node.project) parts.push(`project ${node.project}`);
    parts.push(`${deps} dependencies`);
    parts.push(`${dependents} dependents`);
    return parts.join(', ');
  }

  /** Build an aria-label for an edge row */
  private getEdgeRowLabel(edge: GraphEdge): string {
    const sourceName = this.nodes.find((n) => n.id === edge.source)?.name ?? edge.source;
    const targetName = this.nodes.find((n) => n.id === edge.target)?.name ?? edge.target;
    const kind = edge.kind ?? 'dependency';
    return `${sourceName} depends on ${targetName}, kind ${kind}`;
  }

  override render(): TemplateResult {
    const nodeCount = this.nodes.length;
    const edgeCount = this.edges.length;
    const clusterCount = this.getClusterCount();

    return html`
      <div role="region" aria-label="Graph navigation">
        <p id="graph-summary">
          Graph with ${nodeCount} nodes, ${edgeCount} edges, and ${clusterCount} clusters.
          ${this.selectedNode ? `Selected: ${this.selectedNode.name}.` : ''}
          Use arrow keys to navigate nodes, Enter to select.
        </p>

        <div
          role="tree"
          aria-label="Graph nodes"
          aria-describedby="graph-summary"
          @keydown=${this.handleKeyDown}
        >
          ${this.nodes.map((node, i) => {
            const edgeIds = this.getEdgeIdsForNode(node.id);
            return html`
              <div
                role="treeitem"
                tabindex=${i === this.focusedIndex ? 0 : -1}
                aria-selected=${this.selectedNode?.id === node.id}
                aria-label="${node.name}, ${this.getNodeDescription(node)}"
                aria-describedby=${edgeIds || nothing}
              >
                ${node.name}
              </div>
            `;
          })}
        </div>

        <table role="grid" aria-label="Edge relationships">
          <caption>Edge relationships</caption>
          <thead>
            <tr>
              <th scope="col">Source</th>
              <th scope="col">Target</th>
              <th scope="col">Kind</th>
            </tr>
          </thead>
          <tbody>
            ${this.edges.map(
              (edge, i) => html`
                <tr id="edge-${i}" role="row" aria-label="${this.getEdgeRowLabel(edge)}">
                  <td>${this.nodes.find((n) => n.id === edge.source)?.name ?? edge.source}</td>
                  <td>${this.nodes.find((n) => n.id === edge.target)?.name ?? edge.target}</td>
                  <td>${edge.kind ?? 'dependency'}</td>
                </tr>
              `,
            )}
          </tbody>
        </table>

        <div aria-live="polite" aria-atomic="true">
          ${
            this.selectedNode
              ? html`<p>Selected node: ${this.selectedNode.name}, graph has ${nodeCount} nodes, ${edgeCount} edges, and ${clusterCount} clusters</p>`
              : html`<p>Graph with ${nodeCount} nodes, ${edgeCount} edges, and ${clusterCount} clusters</p>`
          }
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
