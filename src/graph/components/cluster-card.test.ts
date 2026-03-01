/**
 * ClusterCard Component Tests
 *
 * Tests for the SVG cluster card component covering rendering, stroke patterns,
 * selected/highlighted styling, dimmed opacity, accessibility, and click events.
 */

import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import type { Cluster } from '@shared/schemas';
import { ClusterType } from '@shared/schemas/cluster.types';
import { NodeType, Origin, Platform } from '@shared/schemas/graph.types';
import { describe, it } from 'vitest';
import { GraphClusterCard } from './cluster-card';
import './cluster-card';

function createTestCluster(overrides: Partial<Cluster> = {}): Cluster {
	return {
		id: 'ProjectA',
		name: 'ProjectA',
		type: ClusterType.Project,
		origin: Origin.Local,
		nodes: [
			{
				id: 'n1',
				name: 'App',
				type: NodeType.App,
				platform: Platform.iOS,
				origin: Origin.Local,
				project: 'ProjectA',
			},
			{
				id: 'n2',
				name: 'Core',
				type: NodeType.Framework,
				platform: Platform.iOS,
				origin: Origin.Local,
				project: 'ProjectA',
			},
		],
		anchors: [],
		metadata: new Map(),
		...overrides,
	};
}

/**
 * Helper to create a GraphClusterCard element and append it to an SVG fixture.
 * Custom elements must be created with `new` (HTML namespace) then appended
 * to SVG, because elements created directly inside <svg> in JSDOM are in
 * the SVG namespace and do not get upgraded as custom elements.
 */
async function renderCard(props: {
	cluster?: Cluster;
	x?: number;
	y?: number;
	width?: number;
	height?: number;
	isHighlighted?: boolean;
	isDimmed?: boolean;
	isSelected?: boolean;
	zoom?: number;
	clickable?: boolean;
} = {}) {
	const el = new GraphClusterCard();
	el.cluster = props.cluster ?? createTestCluster();
	el.x = props.x ?? 100;
	el.y = props.y ?? 100;
	el.width = props.width ?? 200;
	el.height = props.height ?? 150;
	el.isHighlighted = props.isHighlighted ?? false;
	el.isDimmed = props.isDimmed ?? false;
	el.isSelected = props.isSelected ?? false;
	el.zoom = props.zoom ?? 1;
	el.clickable = props.clickable ?? false;

	const svgEl = await fixture(html`<svg></svg>`);
	svgEl.appendChild(el);
	await el.updateComplete;
	return { svgEl, el };
}

describe('xcode-graph-cluster-card', () => {
	it('should render the cluster name', async () => {
		const { el } = await renderCard();
		const texts = el.querySelectorAll('text');
		const nameText = Array.from(texts).find((t) =>
			t.textContent?.trim() === 'ProjectA',
		);
		expect(nameText).to.exist;
	});

	it('should render the target count', async () => {
		const { el } = await renderCard();
		const texts = el.querySelectorAll('text');
		const countText = Array.from(texts).find((t) =>
			t.textContent?.trim().includes('2 targets'),
		);
		expect(countText).to.exist;
	});

	it('should render empty when no cluster is provided', async () => {
		const el = new GraphClusterCard();
		const svgEl = await fixture(html`<svg></svg>`);
		svgEl.appendChild(el);
		await el.updateComplete;
		const g = el.querySelector('g');
		expect(g).to.be.null;
	});

	it('should use dashed stroke (8 8) for project clusters', async () => {
		const cluster = createTestCluster({ type: ClusterType.Project });
		const { el } = await renderCard({ cluster });
		const borderRect = el.querySelectorAll('rect')[1];
		expect(borderRect).to.exist;
		expect(borderRect!.getAttribute('stroke-dasharray')).to.equal('8 8');
	});

	it('should use dotted stroke (3 8) for package clusters', async () => {
		const cluster = createTestCluster({ type: ClusterType.Package });
		const { el } = await renderCard({ cluster });
		const borderRect = el.querySelectorAll('rect')[1];
		expect(borderRect).to.exist;
		expect(borderRect!.getAttribute('stroke-dasharray')).to.equal('3 8');
	});

	it('should set opacity to 0.3 when isDimmed is true', async () => {
		const { el } = await renderCard({ isDimmed: true });
		const g = el.querySelector('g');
		expect(g).to.exist;
		expect(g!.getAttribute('opacity')).to.equal('0.3');
	});

	it('should set opacity to 1 when isDimmed is false', async () => {
		const { el } = await renderCard({ isDimmed: false });
		const g = el.querySelector('g');
		expect(g).to.exist;
		expect(g!.getAttribute('opacity')).to.equal('1');
	});

	it('should set role=button and tabindex=0 when clickable', async () => {
		const { el } = await renderCard({ clickable: true });
		const g = el.querySelector('g');
		expect(g).to.exist;
		expect(g!.getAttribute('role')).to.equal('button');
		expect(g!.getAttribute('tabindex')).to.equal('0');
	});

	it('should set tabindex=-1 when not clickable', async () => {
		const { el } = await renderCard({ clickable: false });
		const g = el.querySelector('g');
		expect(g).to.exist;
		expect(g!.getAttribute('tabindex')).to.equal('-1');
	});

	it('should have aria-label when clickable', async () => {
		const { el } = await renderCard({ clickable: true });
		const g = el.querySelector('g');
		expect(g).to.exist;
		const label = g!.getAttribute('aria-label');
		expect(label).to.include('ProjectA');
		expect(label).to.include('2 targets');
	});

	it('should dispatch cluster-click on click when clickable', async () => {
		const cluster = createTestCluster();
		const { el } = await renderCard({ cluster, clickable: true });

		setTimeout(() => {
			const g = el.querySelector('g')!;
			g.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		});
		const event = await oneEvent(el, 'cluster-click');
		expect(event).to.exist;
		expect((event as CustomEvent).detail.cluster).to.equal(cluster);
	});

	it('should not dispatch cluster-click on click when not clickable', async () => {
		const { el } = await renderCard({ clickable: false });
		const g = el.querySelector('g')!;

		let fired = false;
		el.addEventListener('cluster-click', () => { fired = true; });
		g.dispatchEvent(new MouseEvent('click', { bubbles: true }));

		await new Promise((r) => setTimeout(r, 50));
		expect(fired).to.be.false;
	});

	it('should dispatch cluster-click on Enter key when clickable', async () => {
		const { el } = await renderCard({ clickable: true });

		setTimeout(() => {
			const g = el.querySelector('g')!;
			g.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
		});
		const event = await oneEvent(el, 'cluster-click');
		expect(event).to.exist;
	});

	it('should dispatch cluster-click on Space key when clickable', async () => {
		const { el } = await renderCard({ clickable: true });

		setTimeout(() => {
			const g = el.querySelector('g')!;
			g.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
		});
		const event = await oneEvent(el, 'cluster-click');
		expect(event).to.exist;
	});

	it('should have higher text opacity when highlighted', async () => {
		const { el } = await renderCard({ isHighlighted: true });
		const texts = el.querySelectorAll('text');
		// When highlighted, textOpacity = 1
		expect(texts.length).to.be.greaterThan(0);
		const style = texts[0]!.getAttribute('style');
		expect(style).to.include('opacity: 1');
	});

	it('should have lower text opacity when not highlighted', async () => {
		const { el } = await renderCard({ isHighlighted: false, isSelected: false });
		const texts = el.querySelectorAll('text');
		expect(texts.length).to.be.greaterThan(0);
		const style = texts[0]!.getAttribute('style');
		expect(style).to.include('opacity: 0.6');
	});
});
