/**
 * Top header component matching Tuist design exactly
 * Spans full width above sidebar and content
 * Uses design system CSS variables
 */

import { Book } from 'lucide-react';

// Selector icon (up/down arrows) from Tabler
const SelectorIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M8 9l4 -4l4 4"></path>
    <path d="M16 15l-4 4l-4 -4"></path>
  </svg>
);

// Slash separator icon from Tabler
const SlashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M17 5l-10 14"></path>
  </svg>
);

export function Header() {
  return (
    <header
      className="h-12 px-4 flex items-center justify-between shrink-0 relative"
      style={{
        backgroundColor: '#18181B',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        zIndex: 50,
      }}
    >
      {/* Left Section: Logo + Breadcrumbs */}
      <div className="flex items-center gap-3">
        {/* Tuist Logo Image */}
        <div
          className="size-7 rounded flex items-center justify-center shrink-0 transition-smooth-fast interactive-scale"
          style={{
            background: 'linear-gradient(135deg, #6F2CFF 0%, #8B5CF6 100%)',
            cursor: 'pointer',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
          </svg>
        </div>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5">
          {/* First Breadcrumb: Organization with Avatar */}
          <button
            className="flex items-center gap-1.5 px-2 py-1 rounded transition-smooth-fast hover:bg-[rgba(255,255,255,0.05)]"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-foreground)',
              borderRadius: 'var(--radius)',
            }}
          >
            {/* Avatar with "T" initial */}
            <div
              className="size-5 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)', // Azure
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '10px',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'white',
              }}
            >
              T
            </div>
            <span>tuist</span>
            <SelectorIcon />
          </button>

          {/* Slash Separator */}
          <div style={{ color: 'rgba(255, 255, 255, 0.3)' }}>
            <SlashIcon />
          </div>

          {/* Second Breadcrumb: Project */}
          <button
            className="flex items-center gap-1.5 px-2 py-1 rounded transition-smooth-fast hover:bg-[rgba(255,255,255,0.05)]"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-foreground)',
              borderRadius: 'var(--radius)',
            }}
          >
            <span>tuist</span>
            <SelectorIcon />
          </button>

          {/* Slash Separator */}
          <div style={{ color: 'rgba(255, 255, 255, 0.3)' }}>
            <SlashIcon />
          </div>
        </div>
      </div>

      {/* Right Section: Actions */}
      <div className="flex items-center gap-2">
        {/* Docs Button */}
        <button
          className="size-8 flex items-center justify-center rounded transition-smooth-fast hover:bg-[rgba(255,255,255,0.05)]"
          style={{
            color: 'rgba(232, 234, 237, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--radius)',
          }}
          title="Documentation"
        >
          <Book className="size-4" />
        </button>

        {/* User Avatar */}
        <button
          className="size-8 rounded-full flex items-center justify-center shrink-0 transition-smooth-fast hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg, #E91E63 0%, #FF6EC7 100%)', // Pink
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '12px',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'white',
          }}
        >
          A
        </button>
      </div>
    </header>
  );
}
