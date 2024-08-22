'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Hero from './Hero';
import Footer from './Footer';
import Header from './Header';
import CarouselComponent from './Carousel';

export default function Home() {
    // Set target values for the stats
    const targetStats = {
        cases: 400,        // Number between 300-500
        newUsers: 1250,    // Number between 1000-1500
        statsProvided: 45, // Number between 30-60
    };

    // Initialize state with 0 for animation start
    const [stats, setStats] = useState({
        cases: 0,
        newUsers: 0,
        statsProvided: 0,
    });

    const [loaded, setLoaded] = useState(false);

    const animateStats = (start, end, setter) => {
        let startTime;
        const duration = 2000; // 2 seconds for the animation

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

        animateStats(0, targetStats.cases, (value) => setStats((prevStats) => ({ ...prevStats, cases: value })));
        animateStats(0, targetStats.newUsers, (value) => setStats((prevStats) => ({ ...prevStats, newUsers: value })));
        animateStats(0, targetStats.statsProvided, (value) => setStats((prevStats) => ({ ...prevStats, statsProvided: value })));
    }, [targetStats.cases, targetStats.newUsers, targetStats.statsProvided]); // Added targetStats dependencies

    return (
        <div className='flex flex-col flex-1 bg-white'>
            <section className={`flex flex-col items-center py-0 px-4 md:px-8 lg:px-16 transform transition-transform duration-700 ${loaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <div className="mx-auto w-[1.5px] h-12 sm:h-16 md:h-20 bg-gradient-to-b from-transparent to-blue-950 mb-10" />
                <div className='max-w-5xl'>
                    <h3 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold my-4 text-center text-blue-950 '>About Cadex Law</h3>
                    <p className='text-base sm:text-lg md:text-xl my-14 text-left text-black'>
                        Cadex Law is an advanced platform designed to simulate real-life legal scenarios, providing a comprehensive tool for legal practitioners, students, and educators. Our AI-powered simulations enable users to engage in interactive, realistic courtroom experiences.
                    </p>
                    <p className='text-base sm:text-lg md:text-xl my-14 text-left text-black'>
                        Whether you&apos;re preparing for the bar exam, enhancing your litigation skills, or teaching law, Cadex Law offers a unique and effective way to practice and improve. Our simulations cover various legal roles, including defendants, plaintiffs, and judges, allowing for a well-rounded learning experience. Our platform also provides instant feedback and analysis on your performance, helping you to identify strengths and areas for improvement. Join Cadex Law today and take your legal practice to the next level with cutting-edge technology.
                    </p>
                </div>
                <div className="flex flex-col lg:flex-row justify-around bg-white shadow-lg rounded-lg p-6 mt-8 w-full">
                    <div className='text-center'>
                        <h4 className='text-4xl font-bold goldGradient'>{stats.cases}</h4>
                        <p className='text-xl text-gray-600'>Cases</p>
                    </div>
                    <div className='text-center'>
                        <h4 className='text-4xl font-bold goldGradient'>{stats.newUsers}</h4>
                        <p className='text-xl text-gray-600'>New Users</p>
                    </div>
                    <div className='text-center'>
                        <h4 className='text-4xl font-bold goldGradient'>{stats.statsProvided}</h4>
                        <p className='text-xl text-gray-600'>Reviews</p>
                    </div>
                </div>
                <p className='text-center text-gray-500 mt-4'>Average Daily Stats</p> {/* Added average daily stats text */}
            </section>  
    
            <div className={`mx-auto w-[1.5px] my-16 h-12 sm:h-16 md:h-20 bg-gradient-to-b from-transparent to-blue-950 mb-4 transform transition-transform duration-700 ${loaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} />    
            <section className={`flex flex-col items-center py-12 px-4 md:px-8 lg:px-16 bg-white transform transition-transform duration-700 ${loaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <div className='max-w-5xl'>
                    <h3 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-center text-blue-950 '>Features</h3>
                    <ul className='list-disc pl-5 my-14'>
                        <li className='text-base sm:text-lg md:text-xl my-2'>Interactive legal simulations for defendants, plaintiffs, and judges.</li>
                        <li className='text-base sm:text-lg md:text-xl my-2'>Instant feedback and performance analysis.</li>
                        <li className='text-base sm:text-lg md:text-xl my-2'>Realistic courtroom experiences.</li>
                        <li className='text-base sm:text-lg md:text-xl my-2'>Comprehensive tool for legal practitioners, students, and educators.</li>
                        <li className='text-base sm:text-lg md:text-xl my-2'>AI-powered technology for enhanced learning.</li>
                    </ul>
                </div>
                <div className='flex justify-center mt-8'>
                    <Link href='/admin' className='before:ease relative h-12 w-56 overflow-hidden rounded bg-gradient-to-r from-blue-950 to-slate-700 text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-56'>
                        <div className='flex items-center justify-center h-full'>
                            Login to Cadex
                        </div>
                    </Link>
                </div>
            </section>
            <section className={`flex flex-col items-center py-10 px-4 md:px-8 lg:px-16 transform transition-transform duration-700 ${loaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <div className='max-w-5xl w-full'>
                    <h3 className='text-4xl lg:text-7xl font-semibold my-14 text-center text-blue-950 '>Universities we work with</h3>
                    <CarouselComponent />
                </div>
            </section>
        </div>
    );
}
