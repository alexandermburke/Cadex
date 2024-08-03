import { Poppins } from 'next/font/google';
import Link from 'next/link';
import React from 'react';
import RegisterBtn from './RegisterButton';
import SearchBtn from './SearchButton';
import GraphicDisplay from './GraphicDisplay';

const poppins = Poppins({ subsets: ["latin"], weight: ['400', '100', '200', '300', '500', '600', '700'] });

export default function Hero() {
    return (
        <section className='flex flex-col flex-1 grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 w-full mx-auto'>
            <div className='flex flex-col flex-1 items-center gap-8 text-center lg:text-left mx-auto w-full'>
                <div className='flex items-center gap-4'>
                    <h2 className={'text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-center lg:text-left ' + poppins.className}>
                        <span className='goldGradient'>Empowering Your Legal Practice</span> with AI
                    </h2>
                </div>
                <p className='text-base sm:text-lg md:text-xl lg:max-w-[80%] lg:mr-auto'>
                    Cadex AI helps <span className='font-medium goldGradient'>simulate real-life legal scenarios</span> to enhance your practice&#44; based on our Database of every known State or Federal case
                </p>
                
                <div className='flex flex-col flex-1 items-center gap-5 text-center lg:text-left mx-auto w-full'>
                    <div />
                    <div />
                    <div className="flex space-x-4">
                         <button className="before:ease relative h-12 w-40 overflow-hidden rounded-lg text-yellow-500 shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-6 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-40 before:duration-700 hover:before:-translate-x-40">
                                 Join Our Team
                        </button>
  <button className="before:ease relative h-12 w-40 overflow-hidden rounded-lg goldBackground text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-6 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-40">
    Learn More Today
  </button>
 
</div>



                </div>     
              
            </div>

            <GraphicDisplay />
        </section>
    );
}
