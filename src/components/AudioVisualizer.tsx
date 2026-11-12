import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  className?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isPlaying, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const numBars = 32;
    const barWidth = 3;
    const barGap = 2;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const midY = canvas.height / 2;
      const totalWidth = numBars * (barWidth + barGap);
      const startX = (canvas.width - totalWidth) / 2;

      for (let i = 0; i < numBars; i++) {
        const x = startX + i * (barWidth + barGap);
        // Harmonic waves simulation reacting to playing state
        let heightRatio = 0.12;
        if (isPlaying) {
          const wave1 = Math.sin(phase + i * 0.35) * 0.45;
          const wave2 = Math.cos(phase * 1.5 + i * 0.2) * 0.35;
          const noise = Math.sin(phase * 3 + i * 0.7) * 0.15;
          heightRatio = Math.max(0.12, Math.abs(wave1 + wave2 + noise));
        }

        const barHeight = Math.max(4, heightRatio * canvas.height * 0.85);
        const y = midY - barHeight / 2;

        // Gradient from violet to fuchsia to cyan
        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isPlaying) {
          grad.addColorStop(0, '#ec4899'); // Neon pink
          grad.addColorStop(0.5, '#a855f7'); // Purple
          grad.addColorStop(1, '#06b6d4'); // Cyan
        } else {
          grad.addColorStop(0, '#475569');
          grad.addColorStop(1, '#334155');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      if (isPlaying) {
        phase += 0.08;
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      width={180}
      height={32}
      className={`rounded pointer-events-none ${className}`}
    />
  );
};
