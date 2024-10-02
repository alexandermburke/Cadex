import { Poppins } from 'next/font/google';
import Link from 'next/link'
import React from 'react'

const poppins = Poppins({ subsets: ["latin"], weight: ['400', '100', '200', '300', '500', '600', '700'] });

export default function Footer() {
    return (
        <footer className='flex flex-col bg-gradient-to-r from-blue-950 to-slate-800 text-white py-4'>
            <div className='flex flex-col sm:flex-row items-center justify-center flex-wrap gap-6 sm:gap-8 md:gap-10 mx-auto py-4 px-8 text-sm'>
                <div className='flex flex-col w-fit shrink-0 gap-2 whitespace-nowrap text-center'>
                    <div className='flex flex-col mx-auto w-fit'>
                        <Link href={'/'}>
                            <h1 className={'text-lg px-3 sm:text-xl sm:px-4 ' + poppins.className}>Cadex Law Simulation</h1>
                        </Link>
                    </div>
                    <p className='mx-auto text-xs'>© 2024 Alexander Burke</p>
                </div>
                <div className='flex flex-col sm:flex-row gap-6 sm:gap-8 md:gap-10'>
                    <div className='flex flex-col gap-2 w-fit'>
                        <h3 className='font-bold'>Navigation</h3>
                        <div className='flex flex-col gap-1 text-sm'>
                            <Link className='relative w-fit overflow-hidden hover:underline' href={'/practice'}><p>Practice</p></Link>
                            <Link className='relative w-fit overflow-hidden hover:underline' href={'/admin'}><p>Login</p></Link>
                            <Link className='relative w-fit overflow-hidden hover:underline' href={'/register'}><p>Join</p></Link>
                        </div>
                    </div>
                    <div className='flex flex-col gap-2 w-fit'>
                        <h3 className='font-bold'>Contact</h3>
                        <div className='flex flex-col gap-1 text-sm'>
                            <Link href={'https://github.com/alexandermburke/enthlist/'} target='_blank' className='flex items-center gap-2 relative w-fit overflow-hidden hover:underline'>
                                <i className="fa-solid fa-envelope"></i>
                                <p>Contact form</p>
                            </Link>
                            <div className='flex items-center gap-2 relative w-fit overflow-hidden'>
                                <i className="fa-solid fa-at"></i>
                                <p>support@cadexlaw.com</p>
                            </div>
                            <div className='flex items-center gap-2 relative w-fit overflow-hidden'>
                                <i className="fa-solid fa-house"></i>
                                <p>14950 N 87th St Scottsdale, AZ</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
