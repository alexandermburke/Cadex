'use client';
import React, { useState, useEffect } from 'react';
import { Poppins } from 'next/font/google';
import Link from 'next/link';
import CarouselComponent from './Carousel';
import Image from 'next/image';
import {
  FaGavel,
  FaSearch,
  FaTasks,
  FaFileAlt,
  FaRobot,
  FaChartLine,
  FaFileContract,
  FaBalanceScale,
  FaThumbsUp,
  FaUsers,
  FaGraduationCap,
} from 'react-icons/fa';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Autoplay } from 'swiper/modules';

import { useInView } from 'react-intersection-observer';

const targetStats = {
  cases: 400,
  newUsers: 1250,
  statsProvided: 45,
};

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
});

export default function Hero() {
  const [loaded, setLoaded] = useState(false);
  const [stats, setStats] = useState({
    cases: 0,
    newUsers: 0,
    statsProvided: 0,
  });

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

  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    const hasSeenDisclaimer = localStorage.getItem('hasSeenDisclaimer');
    if (!hasSeenDisclaimer) {
      setShowDisclaimer(true);
    }

    setLoaded(true);

    animateStats(0, targetStats.cases, (value) =>
      setStats((prevStats) => ({ ...prevStats, cases: value }))
    );
    animateStats(0, targetStats.newUsers, (value) =>
      setStats((prevStats) => ({ ...prevStats, newUsers: value }))
    );
    animateStats(0, targetStats.statsProvided, (value) =>
      setStats((prevStats) => ({ ...prevStats, statsProvided: value }))
    );

    const interval = setInterval(() => {
      setAnimationTrigger((prev) => prev + 1);
    }, animationInterval * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCloseDisclaimer = () => {
    setShowDisclaimer(false);
    localStorage.setItem('hasSeenDisclaimer', 'true');
  };

  const animatedWord = 'Dream';

  const features = [
    {
      icon: <FaGavel className="text-blue-950 text-4xl mb-4" />,
      title: 'Interactive Practice Exams',
      description:
        'Experience real exam conditions with AI-generated practice tests.',
    },
    {
      icon: <FaSearch className="text-blue-950 text-4xl mb-4" />,
      title: 'Personalized Study Materials',
      description:
        'Access study materials tailored to your strengths and weaknesses.',
    },
    {
      icon: <FaTasks className="text-blue-950 text-4xl mb-4" />,
      title: 'Progress Tracking',
      description: 'Monitor your improvement with detailed analytics.',
    },
    {
      icon: <FaFileAlt className="text-blue-950 text-4xl mb-4" />,
      title: 'Instant Feedback',
      description: 'Immediate feedback to identify areas of improvement.',
    },
    {
      icon: <FaRobot className="text-blue-950 text-4xl mb-4" />,
      title: 'AI-Powered Tutoring',
      description: '24/7 AI tutors for quick assistance.',
    },
    {
      icon: <FaChartLine className="text-blue-950 text-4xl mb-4" />,
      title: 'Adaptive Learning',
      description:
        'Material adapts to your learning style.',
    },
    {
      icon: <FaFileContract className="text-blue-950 text-4xl mb-4" />,
      title: 'Exam Strategies',
      description: 'Effective methods for complex questions.',
    },
    {
      icon: <FaBalanceScale className="text-blue-950 text-4xl mb-4" />,
      title: 'Question Bank',
      description: 'Thousands of questions across topics.',
    },
  ];

  const successStories = [
    {
      name: "Jane Doe",
      initialScore: 154,
      newScore: 158,
      difference: 4,
      quote: "Cadex gave me confidence!",
    },
    {
      name: "John Smith",
      initialScore: 148,
      newScore: 155,
      difference: 7,
      quote: "Personalized feedback made the difference.",
    },
    {
      name: "Ayesha Khan",
      initialScore: 160,
      newScore: 165,
      difference: 5,
      quote: "I finally understood the material.",
    },
    {
      name: "Carlos Mendes",
      initialScore: 150,
      newScore: 157,
      difference: 7,
      quote: "Smarter study beats expensive methods.",
    },
    {
      name: "Linda Green",
      initialScore: 152,
      newScore: 160,
      difference: 8,
      quote: "Structure and resources boosted my score!",
    },
    {
      name: "Mark Thompson",
      initialScore: 149,
      newScore: 156,
      difference: 7,
      quote: "7 points in two months!",
    },
    {
      name: "Sophia Ramirez",
      initialScore: 155,
      newScore: 163,
      difference: 8,
      quote: "Instant feedback = huge jump!",
    },
    {
      name: "David Lee",
      initialScore: 151,
      newScore: 158,
      difference: 7,
      quote: "Felt more prepared than ever.",
    },
    {
      name: "Emma Wilson",
      initialScore: 153,
      newScore: 161,
      difference: 8,
      quote: "AI tutoring made learning easy.",
    },
    {
      name: "James Brown",
      initialScore: 147,
      newScore: 154,
      difference: 7,
      quote: "Tailored study materials helped me pass.",
    },
  ];

  const VerticalDivider = () => (
    <div
      className={`mx-auto w-[2px] my-0 bg-gradient-to-b from-transparent via-slate-500 to-blue-950 transition-all duration-700 ${
        loaded ? 'h-12 sm:h-16 md:h-20 opacity-0' : 'h-0 opacity-0'
      }`}
    />
  );

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
    <h3 className="text-4xl sm:text-5xl font-semibold text-center text-blue-950 my-8">
      Who Benefits
    </h3>
    <p className="text-center sm:text-lg md:text-xl text-black max-w-3xl mx-auto my-4">
      From high schoolers to law professionals.
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
      <SwiperSlide style={{ width: '220px', height: '250px' }}>
      <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-white rounded shadow-md hover:shadow-xl transition-shadow">
      <FaGraduationCap className="text-blue-950 text-4xl mb-4" />
          <h4 className="text-xl font-semibold text-blue-950 mb-2 text-center">
            Students
          </h4>
          <p className="text-base text-center text-gray-700">
            Start strong and explore law early
          </p>
        </div>
      </SwiperSlide>
      <SwiperSlide style={{ width: '220px', height: '250px' }}>
      <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-white rounded shadow-md hover:shadow-xl transition-shadow">
      <FaGraduationCap className="text-blue-950 text-4xl mb-4" />
          <h4 className="text-xl font-semibold text-blue-950 mb-2 text-center">
            Undergrads
          </h4>
          <p className="text-base text-center text-gray-700">
            Prep for law school success
          </p>
        </div>
      </SwiperSlide>
      <SwiperSlide style={{ width: '220px', height: '250px' }}>
      <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-white rounded shadow-md hover:shadow-xl transition-shadow">
      <FaGavel className="text-blue-950 text-4xl mb-4" />
          <h4 className="text-xl font-semibold text-blue-950 mb-2 text-center">
            Professionals
          </h4>
          <p className="text-base text-center text-gray-700">
            Enhance knowledge and skills
          </p>
        </div>
      </SwiperSlide>
    </Swiper>
  </div>
</div>


        <VerticalDivider />

        {/* Universities Section */}
        <div
          ref={uniRef}
          className={`flex flex-col items-center px-4 md:px-8 lg:px-16 transition-all duration-1000 ${
            uniInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="max-w-5xl w-full">
            <h3 className="text-4xl sm:text-5xl font-semibold my-8 text-center text-blue-950 ">
              Universities We Partner With
            </h3>
            <CarouselComponent />
          </div>
        </div>
      </div>
    </section>
  );
}
