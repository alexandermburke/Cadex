'use client';
import React, { useState, useEffect } from 'react';
import { Poppins } from 'next/font/google';
import { useAuth } from '@/context/AuthContext';
import HeroBackground from './HeroBackground';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import Link from 'next/link';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100','200','300','400','500','600','700'],
});

export default function Hero() {
  const { userDataObj } = useAuth();
  const isDarkMode = userDataObj?.darkMode ?? true;
  const [loaded, setLoaded] = useState(false);
  const [animationTrigger, setAnimationTrigger] = useState(0);
  const animatedWord = 'Future';
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    setLoaded(true);
    const target = new Date('2025-06-15T00:00:00-07:00');
    const update = () => {
      const now = new Date();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft({ days:0, hours:0, minutes:0, seconds:0 });
      } else {
        setTimeLeft({
          days:  Math.floor(diff / 86400000),
          hours: Math.floor((diff % 86400000) / 3600000),
          minutes: Math.floor((diff % 3600000) / 60000),
          seconds: Math.floor((diff % 60000) / 1000),
        });
      }
    };
    update();
    const cInt = setInterval(update, 1000);
    const aInt = setInterval(() => setAnimationTrigger(t => t + 1), 12000);
    return () => { clearInterval(cInt); clearInterval(aInt); };
  }, []);

  return (
    <section className="w-full h-screen scale-175 mt-128 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <HeroBackground />
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
        <h2 className={clsx(
          'text-7xl sm:text-7xl font-semibold py-2 mb-6',
          isDarkMode ? 'text-white' : 'text-white',
          poppins.className
        )}>
          <span className="block mb-3">
            Welcome to the{' '}
            <span key={animationTrigger} className="relative inline-block" aria-hidden="true">
              {animatedWord.split('').map((l,i) =>
                l === ' ' ? <span key={i}>&nbsp;</span> : (
                  <span
                    key={i}
                    className="flare-letter"
                    style={{ '--animation-delay': `${i * 150}ms` }}
                  >
                    {l}
                  </span>
                )
              )}
            </span>{' '}
            of Legal Education
          </span>
        </h2>
        <p className={clsx(
          'mb-12 mt-4 uppercase tracking-wide',
          isDarkMode ? 'text-gray-300' : 'text-gray-300'
        )}>
          Launching June 15, 2025 at 12:00 AM MST
        </p>
        <motion.div
          className="flex space-x-4 sm:space-x-12 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {['Days','Hours','Minutes','Seconds'].map((label, idx) => {
            const key = ['days','hours','minutes','seconds'][idx];
            return (
              <div key={label} className="flex flex-col items-center">
                <span
                  className={clsx(
                    'text-7xl sm:text-9xl',
                    isDarkMode ? 'text-white' : 'text-white'
                  )}
                  style={{ textShadow: '0 0 12px rgba(255,255,255,0.5)' }}
                >
                  {String(timeLeft[key]).padStart(2, '0')}
                </span>
                <span className={clsx(
                  'uppercase mt-2',
                  isDarkMode ? 'text-gray-300' : 'text-gray-300'
                )}>
                  {label}
                </span>
              </div>
            );
          })}
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Link href="/ailawtools/splash">
            <button className={clsx(
              'px-10 py-3 rounded-lg font-semibold transition gradientShadowHoverBlue',
              isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
            )}>
              Preview Beta
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
