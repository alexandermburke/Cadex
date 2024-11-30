import { Poppins } from 'next/font/google';
import Image from 'next/image';
import React from 'react';

const poppins = Poppins({ subsets: ["latin"], weight: ['400', '100', '200', '300', '500', '600', '700'] });

export default function LogoFiller() {
    return (
        <div className='grid place-items-center flex-1 text-center text-slate-300'>
            <div className='flex flex-col items-center gap-2 font-medium'>
                {/* Header Image */}
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 mx-auto my-auto">
                    <Image
                        src="/header.png" 
                        alt="Cadex Law Logo"
                        layout="fill"
                        objectFit="contain"
                        className="rounded-none" 
                    />
                </div>
                {/* Text Content */}
                <h4 className={'text-xl px-3 sm:text-2xl goldGradient font-medium sm:px-4 ' + poppins.className}>
                    Cadex Law
                </h4>
                <p className='text-blue-950'>
                    Elevate your legal studies<br />
                    Dive into interactive case simulations to enhance your skills
                </p>
            </div>
        </div>
    );
}
