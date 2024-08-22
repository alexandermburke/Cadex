'use client'
import { Inter, Poppins } from 'next/font/google';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from './Button';

const poppins = Poppins({ subsets: ["latin"], weight: ['400', '100', '200', '300', '500', '600', '700'] });

export default function Header() {
    const { currentUser, logout } = useAuth();
    const [showMenu, setShowMenu] = useState(false);
    const [showText, setShowText] = useState(false);
    const [logoLoaded, setLogoLoaded] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (pathname === '/') {
            setLogoLoaded(true);
        } else {
            setLogoLoaded(false);
        }
    }, [pathname]);

    async function copyToClipboard() {
        setShowText(true);
        navigator.clipboard.writeText(`https://cadexlaw.com/${currentUser.displayName}`);
        await new Promise(r => setTimeout(r, 2000));
        setShowText(false);
    }

    let shareBtn = (
        <div className='flex flex-col relative'>    
            <button onClick={() => copyToClipboard()} className='ml duration-200 overflow-hidden p-0.5 rounded-lg relative'>
                <div className='absolute inset-0 goldBackground' />
                <div className='p-2 flex items-center justify-center gap-4 relative w-full z-10 bg-transparent rounded-lg hover:bg-transparent duration-200 text-white hover:text-blue-900'>
                    <p className=''>{showText ? 'Link copied' : 'Share link'}</p>
                </div>
            </button>
        </div>
    );

    let navActions = (
        <nav className='hidden items-stretch md:flex'>
            <Link href={'/admin'} className='mx-2 p-2 px-2 grid place-items-center relative z-10 rounded-lg bg-transparent hover:text-slate-200'>
                <p>Practice</p>
            </Link>
            <Link href={'/pricing'} className='mx-2 p-2 px-2 grid place-items-center relative z-10 rounded-lg bg-transparent hover:text-slate-200'>
                <p>Pricing</p>
            </Link>
            <Link href={'/admin'} className='mx-2 p-2 px-2 grid place-items-center relative z-10 rounded-lg bg-transparent hover:text-slate-200'>
                <p>{currentUser ? 'Dashboard' : 'Login'}</p>
            </Link>
            <Link href={'/careers'} className='mx-2 ml-4 duration-200 overflow-hidden p-0.5 rounded-lg relative'>
                <div className='absolute inset-0' />
                <div className='p-2 grid place-items-center relative z-10 bg-transparent rounded duration-200 text-white before:ease h-10 w-40 overflow-hidden bg-gradient-to-r from-blue-950 to-slate-700 shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-40'>
                    <p>Open Positions</p>
                </div>
            </Link>
        </nav>
    );

    let menuActions = (
        <nav className='flex flex-col gap-2'>
            <Link className='p-2 rounded-lg border-solid border hover:opacity-60 duration-200 text-lg border-blue-950 border-x-4 border-y-4' href={'/admin'}><p>Practice</p></Link>
            <Link className='p-2 rounded-lg border-solid border hover:opacity-60 duration-200 text-lg border-blue-950 border-x-4 border-y-4' href={'/pricing'}><p>Pricing</p></Link>
            <Link className='p-2 rounded-lg border-solid hover:opacity-60 duration-200 text-lg border-blue-950 border-x-4 border-y-4' href={'/admin'}><p>Login</p></Link>
            <Link className='p-2 rounded-lg grid place-items-center relative z-10 bg-gradient-to-r from-blue-950 to-slate-700 duration-200 text-white before:ease overflow-hidden  shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-40' href={'/careers'}><p>{'Open Positions'}</p></Link>
        </nav>
    );

    if (pathname.split('/')[1] === 'admin' && currentUser) {
        navActions = (
            <>
                <p className={'capitalize flex-1 ' + poppins.className}>Welcome <span>{currentUser.displayName}</span></p>
                <div className='hidden items-stretch md:flex'>
                    <Link href={'/admin/practice'} className='border border-solid duration-200 border-transparent hover:border-gold-100 px-4 grid place-items-center rounded-lg'>
                        <p>Practice</p>
                    </Link>
                    <Link href={'/admin'} className='border border-solid duration-200 border-transparent hover:border-gold-100 px-4 grid place-items-center rounded-lg'>
                        <p>Dashboard</p>
                    </Link>
                    <Link href={'/admin/account'} className='border border-solid duration-200 border-transparent hover:border-gold-100 px-4 grid place-items-center rounded-lg'>
                        <p>Account</p>
                    </Link>
                    <button onClick={logout} className='border border-solid duration-200 border-transparent hover:border-gold-100 px-4 grid place-items-center rounded-lg'>
                        <p>Logout</p>
                    </button>
                    {shareBtn}
                </div>
            </>
        );
        menuActions = (
            <nav className='flex flex-col gap-2'>
                <Link href={'/admin'} className='p-2 rounded border-solid border  hover:opacity-60 duration-200 text-lg border-blue-950 border-x-4 border-y-4'><p>Practice</p></Link>
                <Link href={'/admin'} className='p-2 rounded border-solid border  hover:opacity-60 duration-200 text-lg border-blue-950 border-x-4 border-y-4'><p>Dashboard</p></Link>
                <Link href={'/admin/account'} className='p-2 rounded border-solid border  hover:opacity-60 duration-200 text-lg border-blue-950 border-x-4 border-y-4'><p>Account</p></Link>
                <button className='p-2 text-left rounded border-solid border  hover:opacity-60 duration-200 text-lg border-blue-950 border-x-4 border-y-4' onClick={logout}><p>Logout</p></button>
                {shareBtn}
            </nav>
        );
    }

    return (
        <header className='z-[100] fixed top-0 left-0 right-0 bg-transparent'>
            <div className='flex items-center justify-between gap-4 max-w-[1400px] mx-auto w-full overflow-hidden p-2 drop-shadow-sm'>
                <Link href={'/'}>
                    <div className='flex items-center gap-2'>
                        <img src="/header.png" alt="Cadex Law Logo" className={`w-11 h-11 ${logoLoaded ? 'logo-animation' : ''}`} />
                        <h1 className={'text-xl sm:text-2xl goldGradient font-medium ' + poppins.className}>Cadex Law Simulation</h1>
                    </div>
                </Link>
                {navActions}
                <button
                    onClick={() => { setShowMenu(!showMenu) }}
                    className='grid md:hidden place-items-center p-4 duration-200 rounded-lg'
                >
                    {showMenu ? (
                        <i className="fa-solid fa-xmark text-lg icon-transition icon-xmark"></i>
                    ) : (
                        <i className="fa-solid fa-bars text-lg icon-transition icon-bars"></i>
                    )}
                </button>
            </div>

            {showMenu && (
                <div className={`absolute flex flex-col left-4 right-4 md:hidden top-full pt-4 bg-white rounded drop-down-animation`}>
                    <div className='flex flex-col bg-white rounded-2xl p-4'>
                        {menuActions}
                    </div>
                </div>
            )}
        </header>
    );
}
