'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Hero from './Hero';
import Footer from './Footer';
import Header from './Header';
import CarouselComponent from './Carousel';

export default function Home() {
    const [stats, setStats] = useState({ cases: 671, newUsers: 491, statsProvided: 102 });
    const [loaded, setLoaded] = useState(false);

    const animateStats = (start, end, setter) => {
        let startTime;
        const duration = 10000; // 10 seconds

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
        const incrementStats = () => {
            setStats((prevStats) => ({
                cases: prevStats.cases + Math.floor(Math.random() * 41) + 10,
                newUsers: prevStats.newUsers + Math.floor(Math.random() * 41) + 10,
                statsProvided: prevStats.statsProvided + Math.floor(Math.random() * 41) + 10,
            }));
        };

        animateStats(0, stats.cases, (value) => setStats((prevStats) => ({ ...prevStats, cases: value })));
        animateStats(0, stats.newUsers, (value) => setStats((prevStats) => ({ ...prevStats, newUsers: value })));
        animateStats(0, stats.statsProvided, (value) => setStats((prevStats) => ({ ...prevStats, statsProvided: value })));

        const intervalId = setInterval(incrementStats, 24 * 60 * 60 * 1000); // Every 24 hours

        setLoaded(true);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className='flex flex-col flex-1 bg-white'>
            <section className={`flex flex-col items-center py-0 px-4 md:px-8 lg:px-16 transform transition-transform duration-700 ${loaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <div className="mx-auto w-[1.5px] h-12 sm:h-16 md:h-20 bg-gradient-to-b from-transparent to-blue-950 mb-10" />
                <div className='max-w-5xl'>
                    <h3 className='text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold my-4 text-center'>About Cadex Law</h3>
                    <p className='text-base sm:text-lg md:text-xl my-14 text-left text-gray-400'>
                        Cadex Law is an advanced platform designed to simulate real-life legal scenarios, providing a comprehensive tool for legal practitioners, students, and educators. Our AI-powered simulations enable users to engage in interactive, realistic courtroom experiences.
                    </p>
                    <p className='text-base sm:text-lg md:text-xl my-14 text-left text-gray-400'>
                        Whether you&apos;re preparing for the bar exam, enhancing your litigation skills, or teaching law, Cadex Law offers a unique and effective way to practice and improve. Our simulations cover various legal roles, including defendants, plaintiffs, and judges, allowing for a well-rounded learning experience.Our platform also provides instant feedback and analysis on your performance, helping you to identify strengths and areas for improvement. Join Cadex Law today and take your legal practice to the next level with cutting-edge technology.
                    </p>
                </div>
                <div className="flex flex-col lg:flex-row justify-around bg-white shadow-lg rounded-lg p-6 mt-8 w-full">
                    <div className='text-center'>
                        <h4 className='text-3xl font-bold goldGradient'>{stats.cases}</h4>
                        <p className='text-xl text-gray-600'>Cases</p>
                    </div>
                    <div className='text-center'>
                        <h4 className='text-3xl font-bold goldGradient'>{stats.newUsers}</h4>
                        <p className='text-xl text-gray-600'>New Users</p>
                    </div>
                    <div className='text-center'>
                        <h4 className='text-3xl font-bold goldGradient'>{stats.statsProvided}</h4>
                        <p className='text-xl text-gray-600'>Reviews</p>
                    </div>
                </div>
             
            </section>  
    
            <div className={`mx-auto w-[1.5px] my-16 h-12 sm:h-16 md:h-20 bg-gradient-to-b from-transparent to-blue-950 mb-4 transform transition-transform duration-700 ${loaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} />    
            <section className={`flex flex-col items-center py-12 px-4 md:px-8 lg:px-16 bg-white transform transition-transform duration-700 ${loaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <div className='max-w-5xl'>
                    <h3 className='text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-center'>Features</h3>
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
                    <h3 className='text-3xl lg:text-7xl font-semibold my-14 text-center'>Universities we work with</h3>
                    <CarouselComponent />
                </div>
            </section>
        </div>
    );
}
