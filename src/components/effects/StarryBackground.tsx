/**
 * Static pre-rendered starfield canvas
 * Debug version with obvious stars
 */

import { useEffect, useRef } from 'react';

export function StarryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('Canvas not found');
      return;
    }

    console.log('Rendering stars...');

    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('Context not found');
      return;
    }

    // Clear background
    ctx.clearRect(0, 0, width, height);

    console.log(`Canvas size: ${width}x${height}`);

    // Draw large obvious stars first to test
    ctx.fillStyle = 'white';
    ctx.fillRect(100, 100, 5, 5);
    ctx.fillRect(200, 200, 5, 5);
    ctx.fillRect(300, 150, 5, 5);

    console.log('Drew test squares');

    // Generate 300 stars
    for (let i = 0; i < 300; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 2 + 1;

      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    console.log('Drew 300 stars');
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
        backgroundColor: 'transparent',
      }}
    />
  );
}
