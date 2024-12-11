'use client';
import React, { useState, useEffect } from 'react';
import { FaUsers, FaFileAlt, FaRobot, FaTasks, FaThumbsUp } from 'react-icons/fa';
import { useInView } from 'react-intersection-observer';

export default function Hero() {
  const [loaded, setLoaded] = useState(false);

  const VerticalDivider = () => (
    <div
      className={`mx-auto w-[2px] my-0 bg-blue-950 transition-all duration-700 ${
        loaded ? 'h-12 sm:h-16 md:h-20 opacity-0' : 'h-0 opacity-0'
      }`}
    />
  );

  const [processRef, processInView] = useInView({ threshold: 0.1, triggerOnce: true });

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div className="relative w-full bg-blue-950 dropShadow overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-0 relative z-10">
        {/* Geometric Background Layers */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-blue-900 opacity-30 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-blue-700 opacity-30 rounded-full blur-2xl" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-800 opacity-20 rounded-full blur-4xl transform -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Process Visualization Section */}
        <div
          ref={processRef}
          className={`flex flex-col items-center py-20 px-4 md:px-8 lg:px-16 bg-blue-950 transition-all duration-1000 relative z-10 ${
            processInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h3 className="text-5xl sm:text-6xl font-semibold text-center text-white mb-16">
            How It Works
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-16 md:gap-20 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="relative flex flex-col items-center text-center">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-blue-900 rounded-full blur-xl opacity-40" />
              <FaUsers className="text-white text-5xl mb-4" />
              <span className="font-semibold text-white text-xl">Sign Up</span>
              <span className="text-white text-sm mt-1">Create your account & start exploring</span>
            </div>
            <div className="hidden md:block w-16 h-0.5 bg-gray-300 rotate-45" />

            {/* Step 2 */}
            <div className="relative flex flex-col items-center text-center">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-blue-900 rounded-full blur-xl opacity-40" />
              <FaFileAlt className="text-white text-5xl mb-4" />
              <span className="font-semibold text-white text-xl">Assess</span>
              <span className="text-white text-sm mt-1">Take a quick diagnostic</span>
            </div>
            <div className="hidden md:block w-16 h-0.5 bg-gray-300 rotate-45" />

            {/* Step 3 */}
            <div className="relative flex flex-col items-center text-center">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-blue-900 rounded-full blur-xl opacity-40" />
              <FaRobot className="text-white text-5xl mb-4" />
              <span className="font-semibold text-white text-xl">Personalize</span>
              <span className="text-white text-sm mt-1">Get AI-tailored materials</span>
            </div>
            <div className="hidden md:block w-16 h-0.5 bg-gray-300 rotate-45" />

            {/* Step 4 */}
            <div className="relative flex flex-col items-center text-center">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-blue-900 rounded-full blur-xl opacity-40" />
              <FaTasks className="text-white text-5xl mb-4" />
              <span className="font-semibold text-white text-xl">Practice Exams</span>
              <span className="text-white text-sm mt-1">Improve with instant feedback</span>
            </div>
            <div className="hidden md:block w-16 h-0.5 bg-gray-300 rotate-45" />

            {/* Step 5 */}
            <div className="relative flex flex-col items-center text-center">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-blue-900 rounded-full blur-xl opacity-40" />
              <FaThumbsUp className="text-white text-5xl mb-4" />
              <span className="font-semibold text-white text-xl">Succeed</span>
              <span className="text-white text-sm mt-1">Reach your target scores</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
