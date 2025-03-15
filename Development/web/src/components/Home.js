'use client';
import React, { useState, useEffect } from 'react';
import { Poppins } from 'next/font/google';
import Link from 'next/link';
import CarouselComponent from './Carousel';
import Image from 'next/image';
import {
  FaGavel,
  FaGraduationCap,
  FaUniversity,
} from 'react-icons/fa'; // Now using three unique icons
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Autoplay } from 'swiper/modules';
import { useInView } from 'react-intersection-observer';
import { useAuth } from '@/context/AuthContext';

const targetStats = {
  cases: 400,
  newUsers: 1250,
  statsProvided: 45,
};

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
});

export default function Home() {
  const { currentUser, userDataObj } = useAuth();
  const isDarkMode = userDataObj?.darkMode || false;

  const [loaded, setLoaded] = useState(false);
  const [stats, setStats] = useState({
    cases: 0,
    newUsers: 0,
    statsProvided: 0,
  });

  // Animate stats function
  const animateStats = (start, end, setter) => {
    let startTime;
    const duration = 7500;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setter(Math.floor(progress * (end - start) + start));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  };

  const [animationTrigger, setAnimationTrigger] = useState(0);
  const animationInterval = 12;

  useEffect(() => {
    setLoaded(true);

    // Trigger the stat counters
    animateStats(0, targetStats.cases, (value) =>
      setStats((prevStats) => ({ ...prevStats, cases: value }))
    );
    animateStats(0, targetStats.newUsers, (value) =>
      setStats((prevStats) => ({ ...prevStats, newUsers: value }))
    );
    animateStats(0, targetStats.statsProvided, (value) =>
      setStats((prevStats) => ({ ...prevStats, statsProvided: value }))
    );

    // Simple interval to re-run any animations or text transformations
    const interval = setInterval(() => {
      setAnimationTrigger((prev) => prev + 1);
    }, animationInterval * 1000);

    return () => clearInterval(interval);
  }, []);

  // Just a cosmetic divider for transitions
  const VerticalDivider = () => (
    <div
      className={`mx-auto w-[2px] my-0 ${
        isDarkMode
          ? 'bg-white'
          : 'bg-gradient-to-b from-transparent via-slate-500 to-blue-950'
      } transition-all duration-700 ${
        loaded ? 'h-12 sm:h-16 md:h-20 opacity-0' : 'h-0 opacity-0'
      }`}
    />
  );

  // Intersection Observers for fade-in effects
  const [featuresRef, featuresInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [whoRef, whoInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [costRef, costInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [faqRef, faqInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [uniRef, uniInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [storiesRef, storiesInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [processRef, processInView] = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section className="w-full bg-transparent">
      <div className="max-w-7xl mx-auto px-4 py-0">
        {/* Who Can Benefit Section */}
        <div
          ref={whoRef}
          className={`flex flex-col items-center py-4 px-4 md:px-8 lg:px-16 bg-transparent transition-all duration-1000 ${
            whoInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="max-w-7xl w-full">
            <h3
              className={`text-4xl sm:text-5xl font-semibold text-center ${
                isDarkMode ? 'text-white' : 'text-blue-950'
              } my-8`}
            >
              Who Benefits
            </h3>
            <p
              className={`text-center sm:text-lg md:text-xl ${
                isDarkMode ? 'text-white' : 'text-black'
              } max-w-3xl mx-auto my-4`}
            >
              From aspiring learners to seasoned legal professionals.
            </p>
            <Swiper
              modules={[Autoplay]}
              spaceBetween={20}
              slidesPerView={1}
              autoplay={{
                delay: 0,
                disableOnInteraction: false,
              }}
              speed={3000}
              loop={true}
              freeMode={true}
              freeModeMomentum={false}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                },
                1024: {
                  slidesPerView: 3,
                },
              }}
              className="my-4"
            >
              {/* Slide 1 */}
              <SwiperSlide style={{ width: '220px', height: '250px' }}>
                <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-transparent rounded shadow-lg hover:shadow-xl transition-shadow">
                  <FaGraduationCap
                    className={`${isDarkMode ? 'text-white' : 'text-blue-950'} text-4xl mb-4`}
                  />
                  <h4
                    className={`text-xl font-semibold mb-2 text-center ${
                      isDarkMode ? 'text-white' : 'text-blue-950'
                    }`}
                  >
                    Aspiring Undergraduates / High School
                  </h4>
                  <p
                    className={`text-base text-center ${
                      isDarkMode ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    Get a head start, explore legal concepts, and prepare for law school
                  </p>
                </div>
              </SwiperSlide>

              {/* Slide 2 */}
              <SwiperSlide style={{ width: '220px', height: '250px' }}>
                <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-transparent rounded shadow-lg hover:shadow-xl transition-shadow">
                  <FaUniversity
                    className={`${isDarkMode ? 'text-white' : 'text-blue-950'} text-4xl mb-4`}
                  />
                  <h4
                    className={`text-xl font-semibold mb-2 text-center ${
                      isDarkMode ? 'text-white' : 'text-blue-950'
                    }`}
                  >
                    1L, 2L & 3L Students
                  </h4>
                  <p
                    className={`text-base text-center ${
                      isDarkMode ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    Build on your foundation, excel in exams, and tackle advanced coursework
                  </p>
                </div>
              </SwiperSlide>

              {/* Slide 3 */}
              <SwiperSlide style={{ width: '220px', height: '250px' }}>
                <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-transparent rounded shadow-lg hover:shadow-xl transition-shadow">
                  <FaGavel
                    className={`${isDarkMode ? 'text-white' : 'text-blue-950'} text-4xl mb-4`}
                  />
                  <h4
                    className={`text-xl font-semibold mb-2 text-center ${
                      isDarkMode ? 'text-white' : 'text-blue-950'
                    }`}
                  >
                    Sharpen Skills
                  </h4>
                  <p
                    className={`text-base text-center ${
                      isDarkMode ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    Enhance expertise for final year and bar exam readiness
                  </p>
                </div>
              </SwiperSlide>
            </Swiper>
          </div>
        </div>

        <VerticalDivider />

      {/* Universities Section (Commented Out) */}
{/*
<section>
  <div
    ref={uniRef}
    className={`flex flex-col items-center px-4 md:px-8 lg:px-16 transition-all duration-1000 ${
      uniInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
    }`}
  >
    <div className="max-w-5xl w-full">
      <h3
        className={`text-4xl sm:text-5xl font-semibold my-8 text-center ${
          isDarkMode ? 'text-white' : 'text-blue-950'
        }`}
      >
        Universities We Partner With
      </h3>
      <CarouselComponent />
    </div>
  </div>
</section>
*/}

{/* Keep this text active/visible */}
<section>
  <div className="max-w-5xl w-full mx-auto">
    <p
      className={`mt-4 text-center text-sm ${
        isDarkMode ? 'text-gray-300' : 'text-gray-700'
      }`}
    >
      Are you associated with a university and interested in partnering with CadexLaw?
      Please email us at{' '}
      <a
        href="mailto:businessinquires@cadexlaw.com"
        className="text-blue-500 hover:underline"
      >
        businessinquires@cadexlaw.com
      </a>
      .
    </p>
  </div>
</section>
      </div>
    </section>
  );
}
