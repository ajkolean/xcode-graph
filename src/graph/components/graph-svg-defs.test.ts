import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphSVGDefs } from './graph-svg-defs';
import './graph-svg-defs';

// The component disables shadow DOM and renders SVG <defs> directly as children.
// In jsdom, custom elements inside <svg> don't trigger Lit lifecycle,
// so we fixture standalone and query the rendered content.
const createFixture = async () => {
  const el = await fixture<GraphSVGDefs>(html`<xcode-graph-svg-defs></xcode-graph-svg-defs>`);
  await el.updateComplete;
  return el;
};

describe('xcode-graph-svg-defs', () => {
  it('should render #glow filter', async () => {
    const el = await createFixture();
    const glow = el.querySelector('#glow');
    expect(glow).to.exist;
    expect(glow?.tagName.toLowerCase()).to.equal('filter');
  });

  it('should render #glow-strong filter', async () => {
    const el = await createFixture();
    const glowStrong = el.querySelector('#glow-strong');
    expect(glowStrong).to.exist;
    expect(glowStrong?.tagName.toLowerCase()).to.equal('filter');
  });

  it('should render #arrowhead marker', async () => {
    const el = await createFixture();
    const arrowhead = el.querySelector('#arrowhead');
    expect(arrowhead).to.exist;
    expect(arrowhead?.tagName.toLowerCase()).to.equal('marker');
  });

  it('should render #arrowhead-highlight marker', async () => {
    const el = await createFixture();
    const arrowheadHighlight = el.querySelector('#arrowhead-highlight');
    expect(arrowheadHighlight).to.exist;
    expect(arrowheadHighlight?.tagName.toLowerCase()).to.equal('marker');
  });

  it('should render 35 node icon paths (7 types x 5 platforms)', async () => {
    const el = await createFixture();
    const iconPaths = el.querySelectorAll('defs path[id^="node-icon-"]');
    expect(iconPaths.length).to.equal(35);
  });

  it('should render specific icon IDs for known type/platform combos', async () => {
    const el = await createFixture();

    expect(el.querySelector('#node-icon-app-iOS')).to.exist;
    expect(el.querySelector('#node-icon-framework-macOS')).to.exist;
    expect(el.querySelector('#node-icon-library-tvOS')).to.exist;
    expect(el.querySelector('#node-icon-package-watchOS')).to.exist;
    expect(el.querySelector('#node-icon-test-unit-visionOS')).to.exist;
    expect(el.querySelector('#node-icon-test-ui-iOS')).to.exist;
    expect(el.querySelector('#node-icon-cli-macOS')).to.exist;
  });

  it('should have icon IDs matching node-icon-{type}-{platform} pattern', async () => {
    const el = await createFixture();
    const iconPaths = el.querySelectorAll('defs path[id^="node-icon-"]');

    const types = ['app', 'framework', 'library', 'package', 'test-unit', 'test-ui', 'cli'];
    const platforms = ['iOS', 'macOS', 'tvOS', 'watchOS', 'visionOS'];

    const expectedIds = new Set(
      types.flatMap((type) => platforms.map((platform) => `node-icon-${type}-${platform}`)),
    );

    const actualIds = new Set(Array.from(iconPaths).map((p) => p.id));
    expect(actualIds).to.deep.equal(expectedIds);
  });
});
