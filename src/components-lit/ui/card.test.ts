import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  GraphCard,
  GraphCardHeader,
  GraphCardTitle,
  GraphCardDescription,
  GraphCardContent,
  GraphCardFooter,
  GraphCardAction,
} from './card';

describe('GraphCard Components', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  describe('GraphCard', () => {
    it('should be defined as a custom element', () => {
      expect(customElements.get('graph-card')).toBe(GraphCard);
    });

    it('should render correctly', async () => {
      const card = new GraphCard();
      container.appendChild(card);
      await card.updateComplete;

      const div = card.querySelector('[data-slot="card"]');
      expect(div).toBeTruthy();
    });

    it('should use Light DOM', () => {
      const card = new GraphCard();
      expect(card.shadowRoot).toBeNull();
    });
  });

  describe('GraphCardHeader', () => {
    it('should be defined', () => {
      expect(customElements.get('graph-card-header')).toBe(GraphCardHeader);
    });

    it('should render with data-slot', async () => {
      const header = new GraphCardHeader();
      container.appendChild(header);
      await header.updateComplete;

      expect(header.querySelector('[data-slot="card-header"]')).toBeTruthy();
    });
  });

  describe('GraphCardTitle', () => {
    it('should be defined', () => {
      expect(customElements.get('graph-card-title')).toBe(GraphCardTitle);
    });

    it('should render as h4 element', async () => {
      const title = new GraphCardTitle();
      title.textContent = 'Card Title';
      container.appendChild(title);
      await title.updateComplete;

      const h4 = title.querySelector('h4[data-slot="card-title"]');
      expect(h4).toBeTruthy();
    });
  });

  describe('GraphCardDescription', () => {
    it('should be defined', () => {
      expect(customElements.get('graph-card-description')).toBe(GraphCardDescription);
    });

    it('should render as p element', async () => {
      const desc = new GraphCardDescription();
      container.appendChild(desc);
      await desc.updateComplete;

      const p = desc.querySelector('p[data-slot="card-description"]');
      expect(p).toBeTruthy();
    });
  });

  describe('GraphCardContent', () => {
    it('should be defined', () => {
      expect(customElements.get('graph-card-content')).toBe(GraphCardContent);
    });

    it('should render with data-slot', async () => {
      const content = new GraphCardContent();
      container.appendChild(content);
      await content.updateComplete;

      expect(content.querySelector('[data-slot="card-content"]')).toBeTruthy();
    });
  });

  describe('GraphCardFooter', () => {
    it('should be defined', () => {
      expect(customElements.get('graph-card-footer')).toBe(GraphCardFooter);
    });

    it('should render with data-slot', async () => {
      const footer = new GraphCardFooter();
      container.appendChild(footer);
      await footer.updateComplete;

      expect(footer.querySelector('[data-slot="card-footer"]')).toBeTruthy();
    });
  });

  describe('GraphCardAction', () => {
    it('should be defined', () => {
      expect(customElements.get('graph-card-action')).toBe(GraphCardAction);
    });

    it('should render with data-slot', async () => {
      const action = new GraphCardAction();
      container.appendChild(action);
      await action.updateComplete;

      expect(action.querySelector('[data-slot="card-action"]')).toBeTruthy();
    });
  });

  describe('Composition', () => {
    it('should compose a complete card structure', async () => {
      const card = new GraphCard();
      const header = new GraphCardHeader();
      const title = new GraphCardTitle();
      const content = new GraphCardContent();

      title.textContent = 'Test Title';
      content.textContent = 'Test Content';

      header.appendChild(title);
      card.appendChild(header);
      card.appendChild(content);
      container.appendChild(card);

      await card.updateComplete;
      await header.updateComplete;
      await title.updateComplete;
      await content.updateComplete;

      expect(card.querySelector('[data-slot="card"]')).toBeTruthy();
      expect(card.querySelector('[data-slot="card-header"]')).toBeTruthy();
      expect(card.querySelector('[data-slot="card-title"]')).toBeTruthy();
      expect(card.querySelector('[data-slot="card-content"]')).toBeTruthy();
    });
  });
});
