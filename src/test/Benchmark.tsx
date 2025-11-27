import { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/button';
import { LitButton } from '../components-lit/wrappers/Button';

export function Benchmark() {
  const [count, setCount] = useState(0);
  const [renderTimeReact, setRenderTimeReact] = useState(0);
  const [renderTimeLit, setRenderTimeLit] = useState(0);
  const [mode, setMode] = useState<'none' | 'react' | 'lit'>('none');
  
  const startTime = useRef(0);

  useEffect(() => {
    if (mode === 'none') return;
    
    const end = performance.now();
    const duration = end - startTime.current;
    
    if (mode === 'react') {
      setRenderTimeReact(duration);
    } else if (mode === 'lit') {
      setRenderTimeLit(duration);
    }
  }, [count, mode]);

  const runReact = () => {
    setMode('none');
    setTimeout(() => {
      startTime.current = performance.now();
      setMode('react');
      setCount(c => c + 1);
    }, 100);
  };

  const runLit = () => {
    setMode('none');
    setTimeout(() => {
      startTime.current = performance.now();
      setMode('lit');
      setCount(c => c + 1);
    }, 100);
  };

  return (
    <div className="p-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-[var(--colors-foreground)]">Benchmark: Tailwind React vs Native Lit</h1>
        <p className="text-[var(--colors-muted-foreground)]">
          Rendering 1,000 buttons. Lit uses native CSS variables (No Build). React uses Tailwind classes.
        </p>
        
        <div className="flex gap-4">
          <button 
            onClick={runReact}
            className="px-4 py-2 bg-[var(--colors-primary)] text-white rounded hover:opacity-90"
          >
            Run React (Tailwind)
          </button>
          <button 
            onClick={runLit}
            className="px-4 py-2 bg-[var(--colors-primary)] text-white rounded hover:opacity-90"
          >
            Run Lit (Native CSS)
          </button>
        </div>

        <div className="grid grid-cols-2 gap-8 mt-8">
          <div className="p-4 border border-[var(--colors-border)] rounded bg-[var(--colors-card)]">
            <h2 className="font-bold mb-2 text-[var(--colors-foreground)]">React Results</h2>
            <div className="text-3xl font-mono text-[var(--colors-primary)]">
              {renderTimeReact.toFixed(2)}ms
            </div>
          </div>
          <div className="p-4 border border-[var(--colors-border)] rounded bg-[var(--colors-card)]">
            <h2 className="font-bold mb-2 text-[var(--colors-foreground)]">Lit Results</h2>
            <div className="text-3xl font-mono text-[var(--colors-primary)]">
              {renderTimeLit.toFixed(2)}ms
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--colors-border)] pt-8">
        {mode === 'react' && (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 1000 }).map((_, i) => (
              <Button key={i} variant="default" size="sm">Button {i}</Button>
            ))}
          </div>
        )}
        {mode === 'lit' && (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 1000 }).map((_, i) => (
              <LitButton key={i} variant="default" size="sm">Button {i}</LitButton>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
