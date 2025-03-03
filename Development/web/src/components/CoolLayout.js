'use client';

import React, { useEffect, useRef } from 'react';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '@/context/AuthContext';
import { Analytics } from "@vercel/analytics/react"

export default function CoolLayout({ children }) {
    const { userDataObj } = useAuth();

    // Determine if dark mode is enabled
    const isDarkMode = userDataObj?.darkMode || false;
    const canvasRef = useRef(null);

    useEffect(() => {
        // Toggle the 'dark' class on the root element based on dark mode state
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    useEffect(() => {
        if (isDarkMode && canvasRef.current) {
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

            let animationFrameId;
            function animate(time) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                stars.forEach(star => {
                    // Calculate a twinkle factor using a sine wave (0 to 1)
                    const twinkle = (Math.sin(time * 0.001 * star.twinkleSpeed + star.offset) + 1) / 2;
                    ctx.beginPath();
                    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
                    ctx.fill();
                });
                animationFrameId = requestAnimationFrame(animate);
            }
            animate();

            return () => {
                cancelAnimationFrame(animationFrameId);
                window.removeEventListener('resize', resizeCanvas);
            };
        }
    }, [isDarkMode]);

    return (
        <div className={`flex flex-col flex-1 w-full transition-colors duration-300 ${
            isDarkMode 
                ? 'bg-gradient-to-br from-blue-950 via-gray-900 to-slate-950'
                : 'bg-gradient-to-br from-slate-50 via-white to-blue-50'
        }`} style={{ position: 'relative', overflow: 'hidden' }}>
            {isDarkMode && (
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
            )}
            <Header />
            {children}
            <Analytics />
            <Footer />
        </div>
    );
}
