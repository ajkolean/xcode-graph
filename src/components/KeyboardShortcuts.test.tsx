import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { KeyboardShortcuts } from './KeyboardShortcuts';

describe('KeyboardShortcuts', () => {
  describe('closed state', () => {
    it('should render keyboard icon button when closed', () => {
      render(<KeyboardShortcuts />);

      const button = screen.getByTitle('Keyboard shortcuts');
      expect(button).toBeInTheDocument();
    });

    it('should not show shortcuts list when closed', () => {
      render(<KeyboardShortcuts />);

      expect(screen.queryByText('Keyboard Shortcuts')).not.toBeInTheDocument();
    });
  });

  describe('opening', () => {
    it('should open when keyboard button is clicked', async () => {
      render(<KeyboardShortcuts />);

      const button = screen.getByTitle('Keyboard shortcuts');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
      });
    });
  });

  describe('open state', () => {
    it('should display all shortcuts', async () => {
      render(<KeyboardShortcuts />);

      // Open the panel
      const button = screen.getByTitle('Keyboard shortcuts');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Close panels and deselect')).toBeInTheDocument();
      });
      expect(screen.getByText('Focus search')).toBeInTheDocument();
      expect(screen.getByText('Toggle filters')).toBeInTheDocument();
      expect(screen.getByText('Export graph')).toBeInTheDocument();
      expect(screen.getByText('Reset view')).toBeInTheDocument();
      expect(screen.getByText('Select node')).toBeInTheDocument();
      expect(screen.getByText('Pan graph')).toBeInTheDocument();
      expect(screen.getByText('Zoom in/out')).toBeInTheDocument();
    });

    it('should display keyboard keys', async () => {
      render(<KeyboardShortcuts />);

      const button = screen.getByTitle('Keyboard shortcuts');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Esc')).toBeInTheDocument();
      });
      expect(screen.getByText('R')).toBeInTheDocument();
      expect(screen.getByText('Click')).toBeInTheDocument();
      expect(screen.getByText('Drag')).toBeInTheDocument();
      expect(screen.getByText('Scroll')).toBeInTheDocument();
    });

    it('should display command key combinations', async () => {
      render(<KeyboardShortcuts />);

      const button = screen.getByTitle('Keyboard shortcuts');
      fireEvent.click(button);

      // There should be multiple command key symbols
      await waitFor(() => {
        const cmdKeys = screen.getAllByText('⌘');
        expect(cmdKeys.length).toBeGreaterThan(0);
      });
    });
  });

  describe('closing', () => {
    it('should close when X button is clicked', async () => {
      render(<KeyboardShortcuts />);

      // Open
      const openButton = screen.getByTitle('Keyboard shortcuts');
      fireEvent.click(openButton);

      await waitFor(() => {
        expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
      });

      // Find and click the close button
      const closeButtons = screen.getAllByRole('button');
      const closeButton = closeButtons.find((btn) =>
        btn.querySelector('svg.lucide-x')
      );

      if (closeButton) {
        fireEvent.click(closeButton);
      }

      // Should be closed now
      await waitFor(() => {
        expect(screen.queryByText('Keyboard Shortcuts')).not.toBeInTheDocument();
      });
    });
  });

  describe('toggle behavior', () => {
    it('should toggle between open and closed states', async () => {
      render(<KeyboardShortcuts />);

      // Initially closed
      expect(screen.queryByText('Keyboard Shortcuts')).not.toBeInTheDocument();

      // Open
      const openButton = screen.getByTitle('Keyboard shortcuts');
      fireEvent.click(openButton);

      await waitFor(() => {
        expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
      });

      // Close via X button
      const closeButtons = screen.getAllByRole('button');
      const closeButton = closeButtons.find((btn) =>
        btn.querySelector('svg.lucide-x')
      );
      if (closeButton) {
        fireEvent.click(closeButton);
      }

      // Should be closed
      await waitFor(() => {
        expect(screen.queryByText('Keyboard Shortcuts')).not.toBeInTheDocument();
      });
    });
  });
});
