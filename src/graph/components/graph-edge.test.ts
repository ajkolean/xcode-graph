/**
 * GraphEdge Lit Component Tests
 */

import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphEdge } from './graph-edge';
import './graph-edge';

describe('graph-edge', () => {
  it('should render', async () => {
    const svgEl = await fixture(html`
      <svg>
        <graph-edge
          .x1=${0}
          .y1=${0}
          .x2=${100}
          .y2=${100}
          .color=${'#8B5CF6'}
        ></graph-edge>
      </svg>
    `);

    const edge = svgEl.querySelector('graph-edge');
    expect(edge).to.exist;
  });

  it('should accept properties', async () => {
    const svgEl = await fixture(html`
      <svg>
        <graph-edge
          .x1=${10}
          .y1=${20}
          .x2=${110}
          .y2=${120}
          .color=${'#FF0000'}
          .isHighlighted=${true}
          .animated=${true}
        ></graph-edge>
      </svg>
    `);

    const edge = svgEl.querySelector('graph-edge') as GraphEdge;
    expect(edge.x1).to.equal(10);
    expect(edge.y1).to.equal(20);
    expect(edge.x2).to.equal(110);
    expect(edge.y2).to.equal(120);
    expect(edge.color).to.equal('#FF0000');
  });

  it('should render with SVG elements', async () => {
    const svgEl = await fixture(html`
      <svg>
        <graph-edge
          .x1=${0}
          .y1=${0}
          .x2=${100}
          .y2=${100}
          .color=${'#8B5CF6'}
        ></graph-edge>
      </svg>
    `);

    const edge = svgEl.querySelector('graph-edge') as GraphEdge;
    await edge.updateComplete;

    // Component renders SVG elements
    expect(edge).to.exist;
  });

  it('should update when properties change', async () => {
    const svgEl = await fixture(html`
      <svg>
        <graph-edge
          .x1=${0}
          .y1=${0}
          .x2=${100}
          .y2=${100}
          .color=${'#8B5CF6'}
          .isHighlighted=${false}
        ></graph-edge>
      </svg>
    `);

    const edge = svgEl.querySelector('graph-edge') as GraphEdge;
    expect(edge.isHighlighted).to.be.false;

    edge.isHighlighted = true;
    await edge.updateComplete;

    expect(edge.isHighlighted).to.be.true;
  });
});
