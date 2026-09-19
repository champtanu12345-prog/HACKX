import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface LagrangianParticleFlowProps {
  isVisible: boolean;
  hindcastCoords: [number, number][];
  forecastCoords: [number, number][];
  particleCount?: number;
}

interface Particle {
  t: number; // 0 to 1 along trajectory
  speed: number;
  size: number;
  opacity: number;
  type: 'hindcast' | 'forecast';
}

export const LagrangianParticleFlow: React.FC<LagrangianParticleFlowProps> = ({
  isVisible,
  hindcastCoords,
  forecastCoords,
  particleCount = 60,
}) => {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isVisible || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // Initialize particles
    const particles: Particle[] = Array.from({ length: particleCount }).map((_, i) => ({
      t: Math.random(),
      speed: 0.0015 + Math.random() * 0.002,
      size: 1.5 + Math.random() * 2,
      opacity: 0.3 + Math.random() * 0.7,
      type: i % 2 === 0 ? 'hindcast' : 'forecast',
    }));

    const resizeCanvas = () => {
      const size = map.getSize();
      canvas.width = size.x;
      canvas.height = size.y;
    };

    resizeCanvas();
    map.on('resize', resizeCanvas);
    map.on('move', () => {});

    // Linear interpolation along multi-point trajectory
    const getPointAlongPath = (coords: [number, number][], t: number): L.Point | null => {
      if (!coords || coords.length < 2) return null;
      const totalSegments = coords.length - 1;
      const segIndex = Math.min(Math.floor(t * totalSegments), totalSegments - 1);
      const segT = (t * totalSegments) - segIndex;

      const p1 = coords[segIndex];
      const p2 = coords[segIndex + 1];

      const lat = p1[0] + (p2[0] - p1[0]) * segT;
      const lon = p1[1] + (p2[1] - p1[1]) * segT;

      const latLng = L.latLng(lat, lon);
      return map.latLngToContainerPoint(latLng);
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.t += p.speed;
        if (p.t > 1) p.t = 0;

        const coords = p.type === 'hindcast' ? hindcastCoords : forecastCoords;
        const pt = getPointAlongPath(coords, p.t);

        if (pt && pt.x >= 0 && pt.x <= canvas.width && pt.y >= 0 && pt.y <= canvas.height) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, p.size, 0, Math.PI * 2);

          if (p.type === 'hindcast') {
            ctx.fillStyle = `rgba(2, 132, 199, ${p.opacity})`;
            ctx.shadowColor = '#0284C7';
            ctx.shadowBlur = 4;
          } else {
            ctx.fillStyle = `rgba(245, 158, 11, ${p.opacity})`;
            ctx.shadowColor = '#F59E0B';
            ctx.shadowBlur = 4;
          }

          ctx.fill();
          ctx.restore();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      map.off('resize', resizeCanvas);
    };
  }, [map, isVisible, hindcastCoords, forecastCoords, particleCount]);

  if (!isVisible) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-[350]"
      style={{ width: '100%', height: '100%' }}
    />
  );
};
