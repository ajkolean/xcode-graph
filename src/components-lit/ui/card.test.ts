import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { shadowQuery } from '../../test/shadow-helpers';
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

      // Card renders <slot> in Shadow DOM
      expect(card.shadowRoot).toBeTruthy();
    });

    it('should use Shadow DOM', async () => {
      const card = new GraphCard();
      container.appendChild(card);
      await card.updateComplete;

      expect(card.shadowRoot).toBeTruthy();
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

      // CardHeader renders <slot> in Shadow DOM
      expect(header.shadowRoot).toBeTruthy();
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

      // CardTitle renders <slot> in Shadow DOM
      expect(title.shadowRoot).toBeTruthy();
      expect(title.textContent).toBe('Card Title');
    });
  });

  describe('GraphCardDescription', () => {
    it('should be defined', () => {
      expect(customElements.get('graph-card-description')).toBe(GraphCardDescription);
    });

    it('should render as p element', async () => {
      const desc = new GraphCardDescription();
      desc.textContent = 'Description';
      container.appendChild(desc);
      await desc.updateComplete;

      // CardDescription renders <slot> in Shadow DOM
      expect(desc.shadowRoot).toBeTruthy();
      expect(desc.textContent).toBe('Description');
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

      expect(content.shadowRoot).toBeTruthy();
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

      expect(footer.shadowRoot).toBeTruthy();
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

      expect(action.shadowRoot).toBeTruthy();
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

      // Each component has its own Shadow DOM
      expect(card.shadowRoot).toBeTruthy();
      expect(header.shadowRoot).toBeTruthy();
      expect(title.shadowRoot).toBeTruthy();
      expect(content.shadowRoot).toBeTruthy();

      // Components are composed in Light DOM
      expect(card.querySelector('graph-card-header')).toBeTruthy();
      expect(card.querySelector('graph-card-title')).toBeTruthy();
      expect(card.querySelector('graph-card-content')).toBeTruthy();
    });
  });
});
