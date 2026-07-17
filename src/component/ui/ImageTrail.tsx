// src/components/ui/ImageTrail.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';

interface TrailImage {
  id: string;
  x: number;
  y: number;
  url: string;
  scale: number;
  rotation: number;
  opacity: number;
  timestamp: number;
  velocityX: number;
  velocityY: number;
}

interface ImageTrailProps {
  items: string[];
  variant?: '1' | '2' | '3';
  trailLength?: number;
  trailDelay?: number;
  imageSize?: number;
  fadeOutDuration?: number;
  randomRotation?: boolean;
  randomScale?: boolean;
  interactionRadius?: number;
  gravity?: number;
  airResistance?: number;
  bounce?: number;
}

const ImageTrail: React.FC<ImageTrailProps> = ({
  items,
  variant = '1',
  trailLength = 15,
  trailDelay = 30,
  imageSize = 60,
  fadeOutDuration = 800,
  randomRotation = true,
  randomScale = true,
  interactionRadius = 150,
  gravity = 0.2,
  airResistance = 0.98,
  bounce = 0.5,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const imagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const trailsRef = useRef<TrailImage[]>([]);
  const mousePosition = useRef({ x: 0, y: 0, moving: false });
  const lastPosition = useRef({ x: 0, y: 0, timestamp: 0 });
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);

  // Load all images
  useEffect(() => {
    let loadedCount = 0;
    const totalImages = items.length;

    items.forEach((url, index) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = url;
      img.onload = () => {
        imagesRef.current.set(url, img);
        loadedCount++;
        if (loadedCount === totalImages) {
          setAllImagesLoaded(true);
        }
      };
      img.onerror = () => {
        console.error(`Failed to load image: ${url}`);
        loadedCount++;
        if (loadedCount === totalImages) {
          setAllImagesLoaded(true);
        }
      };
    });
  }, [items]);

  // Get random item from array
  const getRandomItem = useCallback(() => {
    return items[Math.floor(Math.random() * items.length)];
  }, [items]);

  // Generate random velocity based on variant
  const getRandomVelocity = useCallback((mouseVelX: number = 0, mouseVelY: number = 0) => {
    switch (variant) {
      case '1': // Explosive outward
        return {
          vx: (Math.random() - 0.5) * 8 + mouseVelX * 0.5,
          vy: (Math.random() - 0.5) * 8 + mouseVelY * 0.5 - 2,
        };
      case '2': // Floating/gentle
        return {
          vx: (Math.random() - 0.5) * 3 + mouseVelX * 0.3,
          vy: (Math.random() - 0.5) * 2 - 1,
        };
      case '3': // Swirling
        return {
          vx: Math.cos(Date.now() / 1000) * 2 + (Math.random() - 0.5) * 2,
          vy: Math.sin(Date.now() / 1000) * 2 + (Math.random() - 0.5) * 2,
        };
      default:
        return {
          vx: (Math.random() - 0.5) * 5,
          vy: (Math.random() - 0.5) * 5 - 1,
        };
    }
  }, [variant]);

  // Handle mouse/touch movement
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      let clientX: number, clientY: number;
      
      if (e instanceof TouchEvent && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if (e instanceof MouseEvent) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else {
        return;
      }

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const now = Date.now();
      
      // Calculate mouse velocity
      const timeDiff = now - lastPosition.current.timestamp;
      let velX = 0, velY = 0;
      if (timeDiff > 0) {
        velX = (x - lastPosition.current.x) / timeDiff * 10;
        velY = (y - lastPosition.current.y) / timeDiff * 10;
      }
      
      // Add new trail image
      if (now - lastPosition.current.timestamp > trailDelay) {
        lastPosition.current = { x, y, timestamp: now };
        
        const newTrail: TrailImage = {
          id: `${Date.now()}-${Math.random()}`,
          x: x,
          y: y,
          url: getRandomItem(),
          scale: randomScale ? 0.5 + Math.random() * 1 : 0.8,
          rotation: randomRotation ? Math.random() * Math.PI * 2 : 0,
          opacity: 1,
          timestamp: now,
          velocityX: getRandomVelocity(velX, velY).vx,
          velocityY: getRandomVelocity(velX, velY).vy,
        };
        
        trailsRef.current = [newTrail, ...trailsRef.current].slice(0, trailLength);
      }
      
      mousePosition.current = { x, y, moving: true };
    };

    const handleLeave = () => {
      mousePosition.current = { x: -1000, y: -1000, moving: false };
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchstart', handleMove);
    window.addEventListener('mouseleave', handleLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchstart', handleMove);
      window.removeEventListener('mouseleave', handleLeave);
    };
  }, [trailDelay, getRandomItem, getRandomVelocity, randomScale, randomRotation, trailLength]);

  // Animation and drawing
  useEffect(() => {
    if (!allImagesLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationTime = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const animate = () => {
      if (!ctx) return;
      
      ctx.clearRect(0, 0, width, height);
      animationTime++;
      
      // Update physics and draw each trail image
      trailsRef.current = trailsRef.current.filter(trail => {
        const age = Date.now() - trail.timestamp;
        const lifeProgress = Math.min(1, age / fadeOutDuration);
        
        // Update opacity based on age
        trail.opacity = Math.max(0, 1 - lifeProgress);
        
        // Update velocity with air resistance
        trail.velocityX *= airResistance;
        trail.velocityY *= airResistance;
        
        // Apply gravity
        trail.velocityY += gravity;
        
        // Update position based on velocity
        trail.x += trail.velocityX;
        trail.y += trail.velocityY;
        
        // Add slight rotation based on velocity
        trail.rotation += trail.velocityX * 0.05;
        
        // Bounce off edges with damping
        if (trail.x < -imageSize || trail.x > width + imageSize || 
            trail.y < -imageSize || trail.y > height + imageSize) {
          return false;
        }
        
        if (trail.x < 0 && trail.velocityX < 0) {
          trail.x = 0;
          trail.velocityX = -trail.velocityX * bounce;
        }
        if (trail.x > width && trail.velocityX > 0) {
          trail.x = width;
          trail.velocityX = -trail.velocityX * bounce;
        }
        if (trail.y < 0 && trail.velocityY < 0) {
          trail.y = 0;
          trail.velocityY = -trail.velocityY * bounce;
        }
        if (trail.y > height && trail.velocityY > 0) {
          trail.y = height;
          trail.velocityY = -trail.velocityY * bounce;
        }
        
        return trail.opacity > 0.01;
      });
      
      // Draw all trail images
      for (const trail of trailsRef.current) {
        const img = imagesRef.current.get(trail.url);
        if (!img) continue;
        
        const age = Date.now() - trail.timestamp;
        const lifeProgress = Math.min(1, age / fadeOutDuration);
        
        // Calculate current scale based on age
        const scaleMultiplier = 1 - lifeProgress * 0.3;
        const finalWidth = imageSize * trail.scale * scaleMultiplier;
        const finalHeight = imageSize * trail.scale * scaleMultiplier;
        
        // Save context state
        ctx.save();
        
        // Apply transformations
        ctx.globalAlpha = trail.opacity * (1 - lifeProgress * 0.2);
        ctx.translate(trail.x, trail.y);
        ctx.rotate(trail.rotation);
        
        // Add shadow for depth
        ctx.shadowBlur = 8;
        ctx.shadowColor = "rgba(168, 85, 247, 0.3)";
        
        // Draw image
        ctx.drawImage(
          img,
          -finalWidth / 2,
          -finalHeight / 2,
          finalWidth,
          finalHeight
        );
        
        // Add glow effect for variant 3
        if (variant === '3') {
          ctx.shadowBlur = 15;
          ctx.shadowColor = "rgba(99, 102, 241, 0.5)";
        }
        
        ctx.restore();
      }
      
      // Draw interactive cursor effect based on variant
      if (mousePosition.current.moving && 
          mousePosition.current.x > 0 && 
          mousePosition.current.x < width) {
        ctx.save();
        
        switch (variant) {
          case '1':
            // Radial gradient
            const gradient = ctx.createRadialGradient(
              mousePosition.current.x, mousePosition.current.y, 0,
              mousePosition.current.x, mousePosition.current.y, interactionRadius
            );
            gradient.addColorStop(0, 'rgba(168, 85, 247, 0.2)');
            gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
            ctx.fillStyle = gradient;
            break;
          case '2':
            // Ring effect
            ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(mousePosition.current.x, mousePosition.current.y, interactionRadius / 2, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = 'rgba(168, 85, 247, 0.05)';
            break;
          case '3':
            // Pulsing circle
            const pulseSize = interactionRadius / 2 + Math.sin(animationTime / 10) * 5;
            ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(mousePosition.current.x, mousePosition.current.y, pulseSize, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = 'rgba(99, 102, 241, 0.08)';
            break;
        }
        
        if (variant !== '2') {
          ctx.beginPath();
          ctx.arc(mousePosition.current.x, mousePosition.current.y, interactionRadius / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    window.addEventListener('resize', resize);
    resize();
    animate();
    
    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [allImagesLoaded, imageSize, fadeOutDuration, gravity, airResistance, bounce, variant, interactionRadius]);

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
        pointerEvents: 'none',
      }}
    />
  );
};

export default ImageTrail;