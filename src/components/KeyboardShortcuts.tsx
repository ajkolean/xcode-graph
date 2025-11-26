import { Keyboard, X } from 'lucide-react';
import { useState } from 'react';

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    { keys: ['Esc'], description: 'Close panels and deselect' },
    { keys: ['⌘', 'F'], description: 'Focus search' },
    { keys: ['⌘', 'K'], description: 'Toggle filters' },
    { keys: ['⌘', 'E'], description: 'Export graph' },
    { keys: ['R'], description: 'Reset view' },
    { keys: ['Click'], description: 'Select node' },
    { keys: ['Drag'], description: 'Pan graph' },
    { keys: ['Scroll'], description: 'Zoom in/out' },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 rounded-lg transition-smooth-fast interactive-scale panel-shadow z-20"
        style={{
          backgroundColor: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-muted-foreground)',
          borderRadius: 'var(--radius)',
        }}
        title="Keyboard shortcuts"
      >
        <Keyboard className="size-5" />
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-4 right-4 glassmorphism panel-shadow-lg z-20 w-80 transition-smooth"
      style={{ borderRadius: 'var(--radius-card)' }}
    >
      <div
        className="p-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-2">
          <Keyboard className="size-4" style={{ color: 'var(--color-muted-foreground)' }} />
          <h3
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-foreground)',
            }}
          >
            Keyboard Shortcuts
          </h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 rounded transition-smooth-fast hover:bg-[var(--color-muted)]"
          style={{
            color: 'var(--color-muted-foreground)',
            borderRadius: 'var(--radius)',
          }}
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="p-3 max-h-96 overflow-y-auto">
        <div className="space-y-2">
          {shortcuts.map((shortcut, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-2 px-2 rounded transition-smooth-fast hover:bg-[var(--color-muted)]"
              style={{ borderRadius: 'var(--radius)' }}
            >
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 'var(--text-label)',
                  color: 'var(--color-muted-foreground)',
                }}
              >
                {shortcut.description}
              </span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, keyIdx) => (
                  <span
                    key={keyIdx}
                    className="px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: 'var(--color-muted)',
                      border: '1px solid var(--color-border)',
                      fontFamily: 'var(--font-family-mono)',
                      fontSize: '11px',
                      color: 'var(--color-foreground)',
                      borderRadius: 'var(--radius)',
                    }}
                  >
                    {key}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
