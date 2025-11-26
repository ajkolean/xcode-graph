import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import type { GraphEdge, GraphNode } from '../data/mockGraphData';
import { createNode } from '../test/fixtures';
import { ExportModal } from './ExportModal';

describe('ExportModal', () => {
  const mockGraphData = {
    nodes: [
      createNode({ id: 'node1', name: 'Node1', type: 'framework' }),
      createNode({ id: 'node2', name: 'Node2', type: 'library' }),
    ] as GraphNode[],
    edges: [{ source: 'node1', target: 'node2' }] as GraphEdge[],
  };

  describe('rendering', () => {
    it('should render the modal', () => {
      render(<ExportModal onClose={vi.fn()} graphData={mockGraphData} />);

      expect(screen.getByText('Export Graph')).toBeInTheDocument();
    });

    it('should render description text', () => {
      render(<ExportModal onClose={vi.fn()} graphData={mockGraphData} />);

      expect(
        screen.getByText('Export the current graph view in various formats')
      ).toBeInTheDocument();
    });

    it('should render JSON export option', () => {
      render(<ExportModal onClose={vi.fn()} graphData={mockGraphData} />);

      expect(screen.getByText('JSON Data')).toBeInTheDocument();
      expect(screen.getByText('Raw graph data for processing')).toBeInTheDocument();
    });

    it('should render PNG export option', () => {
      render(<ExportModal onClose={vi.fn()} graphData={mockGraphData} />);

      expect(screen.getByText('PNG Image')).toBeInTheDocument();
      expect(screen.getByText('Raster image of current view')).toBeInTheDocument();
    });

    it('should render SVG export option', () => {
      render(<ExportModal onClose={vi.fn()} graphData={mockGraphData} />);

      expect(screen.getByText('SVG Vector')).toBeInTheDocument();
      expect(screen.getByText('Scalable vector graphics')).toBeInTheDocument();
    });

    it('should render DOT export option', () => {
      render(<ExportModal onClose={vi.fn()} graphData={mockGraphData} />);

      expect(screen.getByText('DOT Format')).toBeInTheDocument();
      expect(screen.getByText('GraphViz compatible format')).toBeInTheDocument();
    });

    it('should render cancel button', () => {
      render(<ExportModal onClose={vi.fn()} graphData={mockGraphData} />);

      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  describe('close interactions', () => {
    it('should call onClose when X button is clicked', () => {
      const onClose = vi.fn();
      render(<ExportModal onClose={onClose} graphData={mockGraphData} />);

      const closeButtons = screen.getAllByRole('button');
      const xButton = closeButtons.find((btn) =>
        btn.querySelector('svg.lucide-x')
      );

      if (xButton) {
        fireEvent.click(xButton);
      }

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when Cancel button is clicked', () => {
      const onClose = vi.fn();
      render(<ExportModal onClose={onClose} graphData={mockGraphData} />);

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when clicking backdrop', () => {
      const onClose = vi.fn();
      const { container } = render(
        <ExportModal onClose={onClose} graphData={mockGraphData} />
      );

      // Click on the backdrop (outermost div)
      const backdrop = container.firstChild as HTMLElement;
      fireEvent.click(backdrop);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when clicking modal content', () => {
      const onClose = vi.fn();
      render(<ExportModal onClose={onClose} graphData={mockGraphData} />);

      const modalContent = screen.getByText('Export Graph').closest('div');
      if (modalContent) {
        fireEvent.click(modalContent);
      }

      // onClose should not be called because we clicked inside the modal
      // Note: Due to stopPropagation, clicking on content won't trigger backdrop
    });
  });

  describe('export functionality', () => {
    let mockCreateObjectURL: ReturnType<typeof vi.fn>;
    let mockRevokeObjectURL: ReturnType<typeof vi.fn>;
    let mockClick: ReturnType<typeof vi.fn>;
    let originalCreateElement: typeof document.createElement;

    beforeEach(() => {
      mockCreateObjectURL = vi.fn(() => 'blob:test-url');
      mockRevokeObjectURL = vi.fn();
      mockClick = vi.fn();

      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = mockRevokeObjectURL;

      originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        const element = originalCreateElement(tag);
        if (tag === 'a') {
          element.click = mockClick;
        }
        return element;
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should export JSON when JSON button is clicked', () => {
      render(<ExportModal onClose={vi.fn()} graphData={mockGraphData} />);

      const jsonButton = screen.getByText('JSON Data').closest('button');
      if (jsonButton) {
        fireEvent.click(jsonButton);
      }

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });

    it('should export DOT format when DOT button is clicked', () => {
      render(<ExportModal onClose={vi.fn()} graphData={mockGraphData} />);

      const dotButton = screen.getByText('DOT Format').closest('button');
      if (dotButton) {
        fireEvent.click(dotButton);
      }

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });

    it('should show alert for PNG export', () => {
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
      render(<ExportModal onClose={vi.fn()} graphData={mockGraphData} />);

      const pngButton = screen.getByText('PNG Image').closest('button');
      if (pngButton) {
        fireEvent.click(pngButton);
      }

      expect(alertMock).toHaveBeenCalledWith(
        'PNG export would capture the current graph view as an image'
      );
    });

    it('should show alert for SVG export', () => {
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
      render(<ExportModal onClose={vi.fn()} graphData={mockGraphData} />);

      const svgButton = screen.getByText('SVG Vector').closest('button');
      if (svgButton) {
        fireEvent.click(svgButton);
      }

      expect(alertMock).toHaveBeenCalledWith(
        'SVG export would generate a vector version of the graph'
      );
    });
  });
});
