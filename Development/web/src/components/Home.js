import React from 'react';
import Link from 'next/link';
import Hero from './Hero';
import Footer from './Footer';
import Header from './Header';
import CarouselComponent from './Carousel';

export default function Home() {
    return (
        <div className='flex flex-col flex-1 bg-white'>
        
            <section className='flex flex-col items-center py-12 px-4 md:px-8 lg:px-16'>
                <div className='max-w-5xl'>
                    <h3 className='text-2xl lg:text-4xl font-semibold my-4'>About Cadex AI</h3>
                    <p className='text-base sm:text-lg md:text-xl my-2'>
                        Cadex AI is an advanced platform designed to simulate real-life legal scenarios, providing a comprehensive tool for legal practitioners, students, and educators. Our AI-powered simulations enable users to engage in interactive, realistic courtroom experiences.
                    </p>
                    <p className='text-base sm:text-lg md:text-xl my-2'>
                        Whether you&apos;re preparing for the bar exam, enhancing your litigation skills, or teaching law, Cadex AI offers a unique and effective way to practice and improve. Our simulations cover various legal roles, including defendants, plaintiffs, and judges, allowing for a well-rounded learning experience.
                    </p>
                    <p className='text-base sm:text-lg md:text-xl my-2'>
                        Our platform also provides instant feedback and analysis on your performance, helping you to identify strengths and areas for improvement. Join Cadex AI today and take your legal practice to the next level with cutting-edge technology.
                    </p>
                </div>
                <div className='flex flex-wrap gap-8 justify-center mt-8'>
                    <img src='/law-image1.png' alt='Legal Practice' className='w-full md:w-1/3 rounded-lg shadow-lg' />
                    <img src='/law-image3.png' alt='Legal Documentation' className='w-full md:w-1/3 rounded-lg shadow-lg' />
                </div>
            </section>
            <section className='flex flex-col items-center py-12 px-4 md:px-8 lg:px-16 bg-gray-100'>
                <div className='max-w-5xl'>
                    <h3 className='text-2xl lg:text-4xl font-semibold my-4'>Features</h3>
                    <ul className='list-disc pl-5'>
                        <li className='text-base sm:text-lg md:text-xl my-2'>Interactive legal simulations for defendants, plaintiffs, and judges.</li>
                        <li className='text-base sm:text-lg md:text-xl my-2'>Instant feedback and performance analysis.</li>
                        <li className='text-base sm:text-lg md:text-xl my-2'>Realistic courtroom experiences.</li>
                        <li className='text-base sm:text-lg md:text-xl my-2'>Comprehensive tool for legal practitioners, students, and educators.</li>
                        <li className='text-base sm:text-lg md:text-xl my-2'>AI-powered technology for enhanced learning.</li>
                    </ul>
                </div>
                <div className='flex justify-center mt-8'>
                    <Link href='/login' className='before:ease relative h-12 w-40 overflow-hidden rounded-lg border border-slate-900 bg-slate-900 text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-6 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-40'>
                    <div className='flex items-center justify-center h-full'> 
                    Login to Cadex
                      </div>
                    </Link>
                </div>
            </section>
            <section className='flex flex-col items-center py-12 px-4 md:px-8 lg:px-16'>
                <div className='max-w-5xl w-full'>
                    <h3 className='text-2xl lg:text-4xl font-semibold my-4'>Universities we work with</h3>
                    <CarouselComponent />

                </div>
            </section>
           
        </div>
    );
}
