'use client';
import { Inter, Poppins } from 'next/font/google';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
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
        if (!currentUser?.displayName) return;
        setShowText(true);
        navigator.clipboard.writeText(`https://cadexlaw.com/${currentUser.displayName}`);
        await new Promise(r => setTimeout(r, 2000));
        setShowText(false);
    }

    // Updated shareBtn with hover effect for bug icon
    let shareBtn = (
        <div className='flex flex-col relative'>    
        
        </div>
    );

    let navActions = (
        <nav className='hidden items-stretch md:flex'>
            <Link 
                href={'/ailawtools/examprep'} 
                className='border border-solid duration-200 border-transparent hover:text-slate-200 px-4 grid place-items-center rounded'
            >
                <div className="flex items-center">
                    <p>Dashboard</p>
                    <span className="ml-2 px-2 py-1 text-xs bg-emerald-400 text-white rounded">New</span>
                </div>
            </Link>
            <Link 
                href={'/pricing'} 
                className='mx-2 p-2 px-2 grid place-items-center relative z-10 rounded-lg bg-transparent hover:text-slate-200'
            >
                <p>Pricing</p>
            </Link>
            <Link 
                href={'/admin/account'} 
                className='mx-2 p-2 px-2 grid place-items-center relative z-10 rounded-lg bg-transparent hover:text-slate-200'
            >
                <p>{currentUser ? 'Account' : 'Login'}</p>
            </Link>
        </nav>
    );

    let menuActions = (
        <nav className='flex flex-col gap-2'>
            <Link 
                className='p-2 rounded-lg border-solid border duration-200 text-lg hover:text-white hover:bg-blue-950 border-blue-950 border-x-4 border-y-4' 
                href={'/admin'}
            >
                <p>Pro</p>
            </Link>
            <Link 
                className='p-2 rounded-lg border-solid border duration-200 text-lg hover:text-white hover:bg-blue-950 border-blue-950 border-x-4 border-y-4' 
                href={'/pricing'}
            >
                <p>Pricing</p>
            </Link>
        </nav>
    );

    if (
        (pathname.split('/')[1] === 'lawtools' || 
         pathname.split('/')[1] === 'ailawtools' || 
         pathname.split('/')[1] === 'admin') && 
        currentUser
    ) {
        navActions = (
            <>
                <p className={'capitalize flex-1 ' + poppins.className}>
                    Welcome <span>{currentUser.displayName}</span>
                </p>
                <div className='hidden items-stretch md:flex'>
                    <Link 
                        href={'/admin'} 
                        className='border border-solid duration-200 border-transparent hover:text-slate-200 px-4 grid place-items-center rounded'
                    >
                        <p>Pro</p>
                    </Link>
                    <Link 
                        href={'/ailawtools/examprep'} 
                        className='border border-solid duration-200 border-transparent hover:text-slate-200 px-4 grid place-items-center rounded'
                    >
                        <div className="flex items-center">
                            <p>Tools</p>
                            <span className="ml-2 px-2 py-1 text-xs bg-emerald-400 text-white rounded">Beta</span>
                        </div>
                    </Link>
                    <Link 
                        href={'/admin/account'} 
                        className='border border-solid duration-200 border-transparent hover:text-slate-200 px-4 grid place-items-center rounded'
                    >
                        <p>Account</p>
                    </Link>
                    <button 
                        onClick={logout} 
                        className='border border-solid duration-200 border-transparent hover:text-slate-200 px-4 grid place-items-center rounded'
                    >
                        <p>Logout</p>
                    </button>
                    {shareBtn}
                </div>
            </>
        );
        menuActions = (
            <nav className='flex flex-col gap-2'>
                <Link 
                    href={'/ailawtools/examprep'} 
                    className='p-2 rounded border-solid border duration-200 text-lg hover:text-white hover:bg-blue-950 border-blue-950 border-x-4 border-y-4'
                >
                    <div className="flex items-center">
                        <p>Tools</p>
                        <span className="ml-2 px-2 py-1 text-xs bg-emerald-400 text-white rounded">Beta</span>
                    </div>
                </Link>
                <Link 
                    href={'/admin'} 
                    className='p-2 rounded border-solid border duration-200 text-lg hover:text-white hover:bg-blue-950 border-blue-950 border-x-4 border-y-4'
                >
                    <p>Pro</p>
                </Link>
                <Link 
                    href={'/admin/account'} 
                    className='p-2 rounded border-solid border duration-200 hover:text-white hover:bg-blue-950 text-lg border-blue-950 border-x-4 border-y-4'
                >
                    <p>Account</p>
                </Link>
                <button 
                    className='p-2 text-left rounded border-solid border duration-200 hover:text-white hover:bg-blue-950 text-lg border-blue-950 border-x-4 border-y-4' 
                    onClick={logout}
                >
                    <p>Logout</p>
                </button>
                {shareBtn}
            </nav>
        );
    }

    return (
        <header className='z-[100] fixed top-0 left-0 right-0 bg-transparent'>
            <div className='flex items-center justify-between gap-4 max-w-[1400px] mx-auto w-full overflow-hidden p-2 drop-shadow-sm'>
                <Link href={'/'}>
                    <div className='flex items-center gap-2'>
                        <Image 
                            src="/header.avif" 
                            alt="CadexLaw Logo" 
                            width={44} 
                            height={44} 
                            className={`${logoLoaded ? 'logo-animation' : 'w-12 h-12'}`} 
                            unoptimized={true}
                        />
                        <h1 className={'text-xl sm:text-2xl goldGradient font-medium ' + poppins.className}>
                            CadexLaw
                        </h1>
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
