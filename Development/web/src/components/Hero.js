'use client';
import { Poppins } from 'next/font/google';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '100', '200', '300', '500', '600', '700'],
});

export default function Hero() {
  const [loaded, setLoaded] = useState(false);
  const [stats, setStats] = useState({
    cases: 0,
    newUsers: 0,
    statsProvided: 0,
  });

  const targetStats = {
    cases: 400,
    newUsers: 1250,
    statsProvided: 45,
  };

  const animateStats = (start, end, setter) => {
    let startTime;
    const duration = 5000; // 5 seconds for the animation

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

  useEffect(() => {
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
  }, []);

  // Words that will have the flare effect
  const flareWordsFirstLine = ['your'];
  const flareWordsSecondLine = ['Legal', 'Practice'];

  return (
    <section className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div
          className={`flex flex-col items-center gap-6 text-center mx-auto transform transition-transform duration-700 ${
            loaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          {/* First line: Empowering your */}
          <h2
            className={
              'text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold py-2 ' +
              poppins.className
            }
          >
            Empowering{' '}
            {/* Flare effect on "your" */}
            <span className="relative inline-block">
              {flareWordsFirstLine.map((word, wordIndex) => (
                <span key={wordIndex} style={{ whiteSpace: 'nowrap' }}>
                  {word.split('').map((letter, letterIndex) => (
                    <span
                      key={letterIndex}
                      className="flare-letter"
                      data-letter={letter}
                      style={{
                        '--animation-delay': `${
                          (wordIndex * 5 + letterIndex) * 150
                        }ms`,
                      }}
                    >
                      {letter}
                    </span>
                  ))}
                </span>
              ))}
            </span>
          </h2>

          {/* Second line: Legal practice with AI */}
          <h2
            className={
              'text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold py-2 ' +
              poppins.className
            }
          >
            {/* Flare effect on "Legal Practice" */}
            <span className="relative inline-block">
              {flareWordsSecondLine.map((word, wordIndex) => (
                <span key={wordIndex} style={{ whiteSpace: 'nowrap' }}>
                  {word.split('').map((letter, letterIndex) => (
                    <span
                      key={letterIndex}
                      className="flare-letter"
                      data-letter={letter}
                      style={{
                        '--animation-delay': `${
                          (wordIndex * 5 + letterIndex) * 150
                        }ms`,
                      }}
                    >
                      {letter}
                    </span>
                  ))}
                  {' '}
                </span>
              ))}
            </span>
            {' '}with AI
          </h2>

          <p className="text-center sm:text-lg md:text-xl text-black max-w-2xl">
            Cadex helps simulate real-life legal scenarios to enhance your
            practice, based on our Database of every known State or Federal
            case.
          </p>

          <div className="flex justify-center mt-6">
            <Link
              href="/#about"
              className="before:ease relative h-12 w-56 overflow-hidden rounded bg-gradient-to-r from-blue-950 to-slate-700 text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-56"
            >
              <div className="flex items-center justify-center h-full">
                Learn More Today
                <i className="ml-8 fa-solid fa-arrow-right"></i>
              </div>
            </Link>
          </div>

          {/* Average Weekly Stats Section */}
          <div className="flex flex-col lg:flex-row justify-around bg-white shadow-lg rounded p-6 mt-8 w-full">
            <div className="flex flex-1 justify-around items-center">
              <div className="text-center">
                <h4 className="text-3xl sm:text-4xl font-bold goldGradient">
                  {stats.cases}
                </h4>
                <p className="text-base sm:text-lg text-gray-600">Users</p>
              </div>
              <div className="text-center">
                <h4 className="text-3xl sm:text-4xl font-bold goldGradient">
                  {stats.newUsers}
                </h4>
                <p className="text-base sm:text-lg text-gray-600">Cases</p>
              </div>
              <div className="text-center">
                <h4 className="text-3xl sm:text-4xl font-bold goldGradient">
                  {stats.statsProvided}
                </h4>
                <p className="text-base sm:text-lg text-gray-600">Referrals</p>
              </div>
            </div>
          </div>
          <p className="text-center text-gray-500 mt-6">Average Weekly Stats</p>
        </div>

        {/* Vertical Divider */}
        <div className="mx-auto w-[1.5px] my-12 h-12 sm:h-16 md:h-20 bg-gradient-to-b from-transparent to-blue-950" />

        <div
          className={`flex flex-col items-center mt-8 transform transition-transform duration-700 ${
            loaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <h3 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-center text-blue-950 my-8">
            Every Law Tool You Need
          </h3>

          <video
            src="https://www.ninjachat.ai/nArea.mp4"
            autoPlay
            muted
            loop
            className="w-full rounded-lg shadow-lg"
            playsInline
          ></video>
        </div>
      </div>
    </section>
  );
}
