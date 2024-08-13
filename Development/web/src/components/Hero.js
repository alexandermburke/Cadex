'use client'
import { Poppins } from 'next/font/google';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import RegisterBtn from './RegisterButton';
import SearchBtn from './SearchButton';
import GraphicDisplay from './GraphicDisplay';

const poppins = Poppins({ subsets: ["latin"], weight: ['400', '100', '200', '300', '500', '600', '700'] });

export default function Hero() {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoaded(true);
        }, 100); // Adjust delay as needed
        return () => clearTimeout(timer);
    }, []);

    return (
        <section className='flex flex-col flex-1 grid grid-cols-1 lg:grid-cols-1 gap-10 md:gap-16 w-full mx-auto'>
            <div className={`flex flex-col flex-1 items-center gap-8 text-center lg:text-left mx-auto w-full transform transition-transform duration-700 ${loaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <div className='flex items-center gap-4 max-w-3xl'>
                    <h2 className={'text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-center lg:text-center py-8' + poppins.className}>
                    Empowering  <span className='goldGradient'>Your Legal Practice</span> with AI
                    </h2>
                </div>
                <div className='flex flex-col flex-1 grid grid-cols-1 max-w-2xl'>
                    <p className='text-center sm:text-lg md:text-xl lg:mr-auto text-gray-400'>
                        Cadex AI helps simulate real-life legal scenarios to enhance your practice&#44; based on our Database of every known State or Federal case
                    </p>
                </div>
                <div className='flex flex-col flex-1 items-center gap-5 text-center lg:text-left mx-auto w-full'>
                    <div />
                    <div />
                    <div className="flex space-x-4">
                        <Link href='/#about' className='relative rounded px-5 py-2.5 overflow-hidden group bg-gradient-to-r from-slate-900 to-slate-700 text-white hover:ring-2 hover:ring-offset-2 hover:ring-black transition-all ease-out duration-300'>
                            <div className='flex items-center justify-center h-full'>
                                Learn More Today
                                <i className=" px-2 fa-solid fa-arrow-right"></i>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            <div className={`flex flex-wrap gap-8 justify-center mt-8 transform transition-transform duration-700 ${loaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <video 
                    src="https://www.ninjachat.ai/nArea.mp4" 
                    autoPlay 
                    muted 
                    loop 
                    className="w-full rounded-lg shadow-lg"
                    playsInline
                ></video>
            </div>
        </section>
    );
}
