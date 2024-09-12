'use client';
import React from 'react';
import Link from 'next/link';
import CarouselComponent from './Carousel';

export default function Home() {
  return (
    <section className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Vertical Divider */}
        <div className="mx-auto w-[1.5px] my-12 h-12 sm:h-16 md:h-20 bg-gradient-to-b from-transparent to-blue-950" />

        <div className="flex flex-col items-center py-10 px-4 md:px-8 lg:px-16 bg-white">
          <div className="max-w-5xl">
            <h3 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-center text-blue-950 ">
              Features
            </h3>
            <ul className="list-disc pl-5 my-12">
              <li className="text-base sm:text-lg md:text-xl my-2">
                Interactive legal simulations for defendants, plaintiffs, and
                judges.
              </li>
              <li className="text-base sm:text-lg md:text-xl my-2">
                Instant feedback and performance analysis.
              </li>
              <li className="text-base sm:text-lg md:text-xl my-2">
                Realistic courtroom experiences.
              </li>
              <li className="text-base sm:text-lg md:text-xl my-2">
                Comprehensive tool for legal practitioners, students, and
                educators.
              </li>
              <li className="text-base sm:text-lg md:text-xl my-2">
                AI-powered technology for enhanced learning.
              </li>
            </ul>
          </div>
          <div className="flex justify-center mt-8">
            <Link
              href="/admin"
              className="before:ease relative h-12 w-56 overflow-hidden rounded bg-gradient-to-r from-blue-950 to-slate-700 text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-56"
            >
              <div className="flex items-center justify-center h-full">
                Login to Cadex
              </div>
            </Link>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="mx-auto w-[1.5px] my-12 h-12 sm:h-16 md:h-20 bg-gradient-to-b from-transparent to-blue-950" />

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
