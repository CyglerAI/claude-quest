'use client';
import { useEffect, useState } from 'react';

interface Piece {
  id: number;
  left: number;
  color: string;
  size: number;
  duration: number;
  delay: number;
  shape: 'square' | 'circle';
}

const COLORS = ['#a78bfa', '#c084fc', '#fbbf24', '#34d399', '#60a5fa', '#f87171', '#e879f9', '#fb923c'];

export default function Confetti({ active, duration = 3000 }: { active: boolean; duration?: number }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (!active) { setPieces([]); return; }
    const newPieces: Piece[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 4 + Math.random() * 8,
      duration: 1.5 + Math.random() * 2,
      delay: Math.random() * 0.5,
      shape: Math.random() > 0.5 ? 'square' : 'circle',
    }));
    setPieces(newPieces);
    const timer = setTimeout(() => setPieces([]), duration);
    return () => clearTimeout(timer);
  }, [active, duration]);

  if (pieces.length === 0) return null;

  return (
    <>
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </>
  );
}
