import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LegendPanel } from './LegendPanel';

describe('LegendPanel', () => {
  describe('rendering', () => {
    it('should render the legend panel', () => {
      render(<LegendPanel />);

      expect(screen.getByText('Graph Legend')).toBeInTheDocument();
    });

    it('should render node shapes section when expanded', () => {
      render(<LegendPanel />);

      expect(screen.getByText('Node Shapes')).toBeInTheDocument();
    });

    it('should render all node type labels', () => {
      render(<LegendPanel />);

      expect(screen.getByText('App (platform-specific)')).toBeInTheDocument();
      expect(screen.getByText('Framework')).toBeInTheDocument();
      expect(screen.getByText('Library')).toBeInTheDocument();
      expect(screen.getByText('Unit Test')).toBeInTheDocument();
      expect(screen.getByText('UI Test')).toBeInTheDocument();
      expect(screen.getByText('CLI Tool')).toBeInTheDocument();
      expect(screen.getByText('Swift Package')).toBeInTheDocument();
    });

    it('should render platform icons section', () => {
      render(<LegendPanel />);

      expect(screen.getByText('App Platforms')).toBeInTheDocument();
      expect(screen.getByText('iOS')).toBeInTheDocument();
      expect(screen.getByText('macOS')).toBeInTheDocument();
      expect(screen.getByText('visionOS')).toBeInTheDocument();
      expect(screen.getByText('tvOS')).toBeInTheDocument();
      expect(screen.getByText('watchOS')).toBeInTheDocument();
    });

    it('should render edges section', () => {
      render(<LegendPanel />);

      expect(screen.getByText('Edges')).toBeInTheDocument();
      expect(screen.getByText('Dependency')).toBeInTheDocument();
      expect(screen.getByText('Selected Path')).toBeInTheDocument();
    });

    it('should render interactions section', () => {
      render(<LegendPanel />);

      expect(screen.getByText('Interactions')).toBeInTheDocument();
      expect(screen.getByText('• Click node to inspect')).toBeInTheDocument();
      expect(screen.getByText('• Drag to pan')).toBeInTheDocument();
      expect(screen.getByText('• Scroll to zoom')).toBeInTheDocument();
      expect(screen.getByText('• Hover to highlight')).toBeInTheDocument();
    });
  });

  describe('toggle behavior', () => {
    it('should start expanded by default', () => {
      render(<LegendPanel />);

      // Content should be visible
      expect(screen.getByText('Node Shapes')).toBeInTheDocument();
    });

    it('should collapse when header is clicked', () => {
      render(<LegendPanel />);

      const header = screen.getByText('Graph Legend');
      fireEvent.click(header);

      // Content should be hidden
      expect(screen.queryByText('Node Shapes')).not.toBeInTheDocument();
    });

    it('should expand when collapsed header is clicked', () => {
      render(<LegendPanel />);

      const header = screen.getByText('Graph Legend');

      // Collapse
      fireEvent.click(header);
      expect(screen.queryByText('Node Shapes')).not.toBeInTheDocument();

      // Expand
      fireEvent.click(header);
      expect(screen.getByText('Node Shapes')).toBeInTheDocument();
    });
  });

  describe('SVG rendering', () => {
    it('should render SVG elements for node shapes', () => {
      render(<LegendPanel />);

      const svgElements = document.querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThan(0);
    });

    it('should render path elements for node icons', () => {
      render(<LegendPanel />);

      const pathElements = document.querySelectorAll('path');
      expect(pathElements.length).toBeGreaterThan(0);
    });
  });
});
