import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

export interface OceanStreamlinesLayerProps {
  isVisible: boolean;
  particleDensity?: number; // default 140
  flowSpeed?: number;       // speed multiplier
}

interface StreamlineParticle {
  lat: number;
  lon: number;
  age: number;
  maxAge: number;
  speed: number;
  headingRad: number;
  colorType: 'current' | 'wind';
}

export const OceanStreamlinesLayer: React.FC<OceanStreamlinesLayerProps> = ({
  isVisible,
  particleDensity = 140,
  flowSpeed = 1.0,
}) => {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isVisible) return;

    // Create or locate overlay canvas
    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'leaflet-layer';
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '450'; // Above tile layers, below UI controls
      const pane = map.getPanes().overlayPane;
      pane.appendChild(canvas);
      canvasRef.current = canvas;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;

    const resizeCanvas = () => {
      if (!canvas) return;
      const size = map.getSize();
      canvas.width = size.x;
      canvas.height = size.y;
      const topLeft = map.containerPointToLayerPoint([0, 0]);
      L.DomUtil.setPosition(canvas, topLeft);
    };

    resizeCanvas();
    map.on('resize', resizeCanvas);
    map.on('move', resizeCanvas);
    map.on('zoom', resizeCanvas);

    // Bounding Box around Arabian Sea / Mumbai High / Konkan Coast
    const bounds = map.getBounds();
    const minLat = Math.max(bounds.getSouth(), 17.5);
    const maxLat = Math.min(bounds.getNorth(), 20.8);
    const minLon = Math.max(bounds.getWest(), 70.5);
    const maxLon = Math.min(bounds.getEast(), 74.0);

    // Initialize particles across Arabian Sea grid
    const particles: StreamlineParticle[] = Array.from({ length: particleDensity }).map((_, i) => {
      // Hydrodynamic heading based on West India Coastal Current (north-northeast ~65°-75°)
      const isCurrent = i % 3 !== 0;
      const headingDeg = isCurrent ? 68 + (Math.random() * 15 - 7.5) : 80 + (Math.random() * 20 - 10);
      return {
        lat: minLat + Math.random() * (maxLat - minLat),
        lon: minLon + Math.random() * (maxLon - minLon),
        age: Math.random() * 120,
        maxAge: 80 + Math.random() * 80,
        speed: (isCurrent ? 0.0035 : 0.005) * flowSpeed,
        headingRad: (headingDeg * Math.PI) / 180,
        colorType: isCurrent ? 'current' : 'wind',
      };
    });

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        // Move particle along heading
        p.lat += Math.cos(p.headingRad) * p.speed * 0.45;
        p.lon += Math.sin(p.headingRad) * p.speed * 0.85;
        p.age += 1;

        // Reset if out of bounds or expired
        const currBounds = map.getBounds();
        if (
          p.age > p.maxAge ||
          p.lat < currBounds.getSouth() ||
          p.lat > currBounds.getNorth() ||
          p.lon < currBounds.getWest() ||
          p.lon > currBounds.getEast()
        ) {
          p.lat = currBounds.getSouth() + Math.random() * (currBounds.getNorth() - currBounds.getSouth());
          p.lon = currBounds.getWest() + Math.random() * (currBounds.getEast() - currBounds.getWest());
          p.age = 0;
        }

        const screenPt = map.latLngToContainerPoint(L.latLng(p.lat, p.lon));

        if (
          screenPt.x >= 0 &&
          screenPt.x <= canvas.width &&
          screenPt.y >= 0 &&
          screenPt.y <= canvas.height
        ) {
          const lifeFraction = p.age / p.maxAge;
          const alpha = Math.sin(lifeFraction * Math.PI) * 0.75; // Smooth fade in and fade out

          ctx.save();
          ctx.beginPath();
          ctx.arc(screenPt.x, screenPt.y, p.colorType === 'current' ? 1.8 : 1.4, 0, Math.PI * 2);

          if (p.colorType === 'current') {
            ctx.fillStyle = `rgba(0, 240, 255, ${alpha})`;
            ctx.shadowColor = '#00F0FF';
            ctx.shadowBlur = 3;
          } else {
            ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`;
            ctx.shadowColor = '#10B981';
            ctx.shadowBlur = 2;
          }

          ctx.fill();

          // Render miniature streamline tail
          const tailLen = 14;
          const tailX = screenPt.x - Math.sin(p.headingRad) * tailLen;
          const tailY = screenPt.y - Math.cos(p.headingRad) * tailLen;

          ctx.beginPath();
          ctx.moveTo(screenPt.x, screenPt.y);
          ctx.lineTo(tailX, tailY);
          ctx.strokeStyle =
            p.colorType === 'current'
              ? `rgba(0, 240, 255, ${alpha * 0.4})`
              : `rgba(16, 185, 129, ${alpha * 0.4})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.restore();
        }
      });

      animFrame = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrame);
      map.off('resize', resizeCanvas);
      map.off('move', resizeCanvas);
      map.off('zoom', resizeCanvas);
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
        canvasRef.current = null;
      }
    };
  }, [isVisible, map, particleDensity, flowSpeed]);

  return null;
};
