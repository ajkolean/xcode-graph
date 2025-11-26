import { Search, X } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function SearchBar({ searchQuery, onSearchChange }: SearchBarProps) {
  return (
    <div className="px-4 pb-3">
      <div className="relative group">
        <Search 
          className="absolute left-3 top-1/2 -translate-y-1/2 size-4 transition-colors"
          style={{ color: 'var(--color-muted-foreground)' }}
        />
        <input
          type="text"
          placeholder="Filter nodes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-12 py-2 rounded-lg transition-all"
          style={{
            backgroundColor: 'var(--color-input-background)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-foreground)',
            fontFamily: 'Inter, sans-serif',
            fontSize: 'var(--text-label)',
            borderRadius: 'var(--radius)'
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              onSearchChange('');
              e.currentTarget.blur();
            }
          }}
        />
        
        {/* Clear button OR Keyboard hint - same position */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {searchQuery ? (
            <button
              onClick={() => onSearchChange('')}
              className="p-1 rounded transition-smooth-fast hover:bg-[rgba(255,255,255,0.1)]"
              title="Clear search"
              style={{
                color: 'var(--color-muted-foreground)'
              }}
            >
              <X className="size-3" />
            </button>
          ) : (
            <div 
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none px-1.5 py-0.5 rounded transition-opacity"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontFamily: 'var(--font-family-mono)',
                fontSize: '10px',
                color: 'var(--color-foreground)',
                opacity: 0.3
              }}
            >
              ⌘F
            </div>
          )}
        </div>
      </div>
    </div>
  );
}