// src/components/ui/MagicRings.tsx
import React, { useEffect, useRef } from 'react';

interface MagicRingsProps {
  color?: string;
  colorTwo?: string;
  ringCount?: number;
  speed?: number;
  attenuation?: number;
  lineThickness?: number;
  baseRadius?: number;
  radiusStep?: number;
  scaleRate?: number;
  opacity?: number;
  blur?: number;
  noiseAmount?: number;
  rotation?: number;
  ringGap?: number;
  fadeIn?: number;
  fadeOut?: number;
  followMouse?: boolean;
  mouseInfluence?: number;
  hoverScale?: number;
  parallax?: number;
  clickBurst?: boolean;
}

const MagicRings: React.FC<MagicRingsProps> = ({
  color = "#A855F7",
  colorTwo = "#6366F1",
  ringCount = 6,
  speed = 1,
  attenuation = 10,
  lineThickness = 2,
  baseRadius = 0.35,
  radiusStep = 0.1,
  scaleRate = 0.1,
  opacity = 0.3,
  blur = 0,
  noiseAmount = 0.1,
  rotation = 0,
  ringGap = 1.5,
  fadeIn = 0.7,
  fadeOut = 0.5,
  followMouse = true,
  mouseInfluence = 0.2,
  hoverScale = 1.2,
  parallax = 0.05,
  clickBurst = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const mousePosition = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (followMouse) {
        mousePosition.current = {
          x: (e.clientX / width) * 2 - 1,
          y: (e.clientY / height) * 2 - 1,
        };
      }
    };

    const animate = () => {
      if (!ctx) return;
      
      ctx.clearRect(0, 0, width, height);
      
      timeRef.current += 0.01 * speed;
      const t = timeRef.current;

      const centerX = width / 2;
      const centerY = height / 2;
      
      // Apply mouse influence
      let offsetX = 0;
      let offsetY = 0;
      if (followMouse) {
        offsetX = mousePosition.current.x * mouseInfluence * Math.min(width, height) * 0.2;
        offsetY = mousePosition.current.y * mouseInfluence * Math.min(width, height) * 0.2;
      }

      for (let i = 0; i < ringCount; i++) {
        const progress = i / ringCount;
        const radius = Math.min(width, height) * (baseRadius + i * radiusStep);
        const ringRotation = rotation + t * (1 - progress * 0.5);
        
        ctx.save();
        ctx.translate(centerX + offsetX * (1 - progress), centerY + offsetY * (1 - progress));
        ctx.rotate(ringRotation);
        ctx.beginPath();
        
        const ringOpacity = opacity * (1 - progress * fadeOut) * Math.min(1, t * fadeIn);
        const gradient = ctx.createLinearGradient(-radius, -radius, radius, radius);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, colorTwo);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = lineThickness * (1 - progress * 0.5);
        ctx.globalAlpha = ringOpacity;
        
        // Add noise effect
        if (noiseAmount > 0) {
          ctx.shadowBlur = blur;
          ctx.shadowColor = color;
        }
        
        const scale = 1 + Math.sin(t * scaleRate + i) * 0.05;
        ctx.ellipse(0, 0, radius * scale, radius * scale * ringGap, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [color, colorTwo, ringCount, speed, attenuation, lineThickness, baseRadius, radiusStep, scaleRate, opacity, blur, noiseAmount, rotation, ringGap, fadeIn, fadeOut, followMouse, mouseInfluence, hoverScale, parallax, clickBurst]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    />
  );
};

export default MagicRings;