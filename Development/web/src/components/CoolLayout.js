'use client';

import React, { useEffect, useRef } from 'react';
import Header from './Header';
import Footer from './Footer';
import { Analytics } from "@vercel/analytics/react";

export default function CoolLayout({ children }) {
  const canvasRef = useRef(null);

  // Always apply dark mode by adding the 'dark' class once
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      // Generate a star field with random positions, sizes, and twinkle speeds
      const numStars = 200;
      const stars = [];
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5 + 0.5, // Radius between 0.5 and 2
          twinkleSpeed: Math.random() * 1 + 0.5, // Speed between 0.5 and 1.5
          offset: Math.random() * Math.PI * 2,  // Random initial phase
        });
      }

      // Array for shooting stars
      const shootingStars = [];

      // Helper function to spawn a single shooting star
      function spawnShootingStar() {
        return {
          x: Math.random() * canvas.width,       // Random starting X
          y: Math.random() * canvas.height,        // Random starting Y
          length: Math.random() * 80 + 20,           // Trail length
          speed: Math.random() * 2 + 2,              // Speed
          angle: Math.random() * Math.PI * 2,        // Random direction
          opacity: 1                               // Start fully visible
        };
      }

      let animationFrameId;
      function animate(time) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        stars.forEach(star => {
          const twinkle = (Math.sin(time * 0.001 * star.twinkleSpeed + star.offset) + 1) / 2;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
          ctx.fill();
        });

        // Occasionally spawn a new shooting star
        if (Math.random() < 0.003) { 
          shootingStars.push(spawnShootingStar());
        }

        shootingStars.forEach((star, index) => {
          star.x += Math.cos(star.angle) * star.speed;
          star.y += Math.sin(star.angle) * star.speed;

          star.opacity -= 0.005;

          ctx.beginPath();
          ctx.moveTo(star.x, star.y);
          ctx.lineTo(
            star.x - Math.cos(star.angle) * star.length,
            star.y - Math.sin(star.angle) * star.length
          );
          ctx.strokeStyle = `rgba(255, 255, 255, ${star.opacity})`;
          ctx.lineWidth = 2;
          ctx.stroke();

          if (
            star.opacity <= 0 ||
            star.x < 0 || star.x > canvas.width ||
            star.y < 0 || star.y > canvas.height
          ) {
            shootingStars.splice(index, 1);
          }
        });

        animationFrameId = requestAnimationFrame(animate);
      }
      animate();

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', resizeCanvas);
      };
    }
  }, []);

  return (
    <div
      className="flex flex-col flex-1 w-full transition-colors duration-300 bg-gradient-to-br from-blue-950 via-gray-900 to-slate-950"
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <Header />
      {children}
      <Analytics />
      <Footer />
    </div>
  );
}
