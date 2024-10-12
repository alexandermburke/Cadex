'use client';
import React from 'react';
import Link from 'next/link';
import CarouselComponent from './Carousel';
import {
  FaGavel,
  FaSearch,
  FaTasks,
  FaFileAlt,
  FaRobot,
  FaChartLine,
  FaFileContract,
  FaBalanceScale,
} from 'react-icons/fa';

export default function Home() {
  const features = [
    {
      icon: <FaGavel className="text-blue-950 text-4xl mb-4" />,
      title: 'Interactive Legal Simulations',
      description: 'Experience simulations for defendants, plaintiffs, and judges.',
    },
    {
      icon: <FaSearch className="text-blue-950 text-4xl mb-4" />,
      title: 'Legal Research',
      description: 'Access to extensive legal research databases.',
    },
    {
      icon: <FaTasks className="text-blue-950 text-4xl mb-4" />,
      title: 'Case Management',
      description: 'Efficiently track and organize cases.',
    },
    {
      icon: <FaFileAlt className="text-blue-950 text-4xl mb-4" />,
      title: 'Document Drafting',
      description: 'AI-powered suggestions for drafting legal documents.',
    },
    {
      icon: <FaRobot className="text-blue-950 text-4xl mb-4" />,
      title: 'AI Law Tools',
      description: 'Enhance legal strategy and decision-making with AI.',
    },
    {
      icon: <FaChartLine className="text-blue-950 text-4xl mb-4" />,
      title: 'Predictive Analytics',
      description: 'Forecast case outcomes with advanced analytics.',
    },
    {
      icon: <FaFileContract className="text-blue-950 text-4xl mb-4" />,
      title: 'Contract Review',
      description: 'Faster, more accurate assessments using AI.',
    },
    {
      icon: <FaBalanceScale className="text-blue-950 text-4xl mb-4" />,
      title: 'AI Law Simulation',
      description: 'Simulate cases for practical experience.',
    },
  ];

  return (
    <section className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Vertical Divider */}
        <div className="mx-auto w-[1.5px] my-12 h-12 sm:h-16 md:h-20 bg-gradient-to-b from-transparent to-blue-950 opacity-0" />

        {/* Features Section */}
        <div className="flex flex-col items-center py-10 px-4 md:px-8 lg:px-16 bg-white">
          <div className="max-w-5xl">
            <h3 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-center text-blue-950">
              Features
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 my-12">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center p-6 bg-gray-50 rounded-lg shadow-md hover:shadow-xl transition-shadow"
                >
                  {feature.icon}
                  <h4 className="text-xl font-semibold text-blue-950 mb-2 text-center">
                    {feature.title}
                  </h4>
                  <p className="text-base text-center text-gray-700">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
    
        </div>

        {/* Vertical Divider */}
        <div className="mx-auto w-[1.5px] my-12 h-12 sm:h-16 md:h-20 bg-gradient-to-b from-transparent to-blue-950 opacity-0" />

        {/* Universities Section */}
        <div className="flex flex-col items-center py-8 px-4 md:px-8 lg:px-16">
          <div className="max-w-5xl w-full">
            <h3 className="text-4xl lg:text-7xl font-semibold my-12 text-center text-blue-950 ">
              Universities we work with
            </h3>
            <CarouselComponent />
          </div>
        </div>
      </div>
    </section>
  );
}
