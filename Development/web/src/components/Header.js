'use client';
import { Poppins } from 'next/font/google';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import Button from './Button';

const poppins = Poppins({ subsets: ["latin"], weight: ['400', '100', '200', '300', '500', '600', '700'] });

export default function Header() {
    const { currentUser, logout, userDataObj } = useAuth();
    const [showMenu, setShowMenu] = useState(false);
    const [showText, setShowText] = useState(false);
    const [logoLoaded, setLogoLoaded] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

      const isDemoUser = currentUser?.uid === 'demo-user-uid';
      const [isDarkMode, setIsDarkMode] = useState(false);
    
      useEffect(() => {
        if (isDemoUser) {
          const storedDarkMode = localStorage.getItem('demoDarkMode');
          setIsDarkMode(storedDarkMode === 'true');
        } else {
          setIsDarkMode(userDataObj?.darkMode || false);
        }
      }, [isDemoUser, userDataObj?.darkMode]);
      useEffect(() => {
        if (isDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }, [isDarkMode]);

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

    let shareBtn = (
        <div className='flex flex-col relative'>
            {/* Add share-related UI here if needed */}
        </div>
    );

    let navActions = (
        <nav className='hidden items-stretch md:flex'>
            <Link 
                href={'/ailawtools/splash'} 
                className={`border border-solid duration-200 border-transparent px-4 grid place-items-center rounded 
                ${isDarkMode ? 'hover:text-slate-500' : 'hover:text-slate-200'} text-${isDarkMode ? 'white' : 'black'}`}
            >
                <div className="flex items-center">
                    <p>Dashboard</p>
                </div>
            </Link>
            <Link 
                href={'/pricing'} 
                className={`mx-2 p-2 px-2 grid place-items-center relative z-10 rounded-lg bg-transparent 
                ${isDarkMode ? 'hover:text-slate-500' : 'hover:text-slate-200'} text-${isDarkMode ? 'white' : 'black'}`}
            >
                <p>Pricing</p>
            </Link>
            <Link 
                href={'/admin/account'} 
                className={`mx-2 p-2 px-2 grid place-items-center relative z-10 rounded-lg bg-transparent
                ${isDarkMode ? 'hover:text-slate-500' : 'hover:text-slate-200'} text-${isDarkMode ? 'white' : 'black'}`}
            >
                <p>{currentUser ? 'Account' : 'Login'}</p>
            </Link>
        </nav>
    );

    let menuActions = (
        <nav className='flex flex-col gap-2'>
            <Link 
                className={`p-2 rounded-lg border-solid border duration-200 text-lg border-blue-950 border-x-4 border-y-4 
                ${isDarkMode ? 'hover:text-slate-500 hover:bg-blue-950 text-white' : 'hover:text-slate-200 hover:bg-blue-950 text-black'}`}
                href={'/ailawtools/splash'}
            >
                <p>Dashboard</p>
            </Link>
            <Link 
                className={`p-2 rounded-lg border-solid border duration-200 text-lg border-blue-950 border-x-4 border-y-4 
                ${isDarkMode ? 'hover:text-slate-500 hover:bg-blue-950 text-white' : 'hover:text-slate-200 hover:bg-blue-950 text-black'}`}
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
              
                <div className='hidden items-stretch md:flex'>
                    <Link 
                        href={'/ailawtools/splash'} 
                        className={`border border-solid duration-200 border-transparent px-4 grid place-items-center rounded
                        ${isDarkMode ? 'hover:text-slate-500' : 'hover:text-slate-200'} text-${isDarkMode ? 'white' : 'black'}`}
                    >
                        <div className="flex items-center">
                            <p>Dashboard</p>
                        </div>
                    </Link>
                    <Link 
                        href={'/admin/account'} 
                        className={`border border-solid duration-200 border-transparent px-4 grid place-items-center rounded
                        ${isDarkMode ? 'hover:text-slate-500' : 'hover:text-slate-200'} text-${isDarkMode ? 'white' : 'black'}`}
                    >
                        <p>Account</p>
                    </Link>
                </div>
            </>
        );
        menuActions = (
            <nav className='flex flex-col gap-2'>
                <Link 
                    href={'/ailawtools/splash'} 
                    className={`p-2 rounded border-solid border duration-200 text-lg border-blue-950 border-x-4 border-y-4
                    ${isDarkMode ? 'hover:text-slate-500 hover:bg-blue-950 text-white' : 'hover:text-slate-500 hover:bg-blue-950 text-black'}`}
                >
                    <div className="flex items-center">
                        <p>Dashboard</p>
                    </div>
                </Link>
                <Link 
                    href={'/admin/account'} 
                    className={`p-2 rounded border-solid border duration-200 text-lg border-blue-950 border-x-4 border-y-4
                    ${isDarkMode ? 'hover:text-slate-500 hover:bg-blue-950 text-white' : 'hover:text-slate-500 hover:bg-blue-950 text-black'}`}
                >
                    <p>Account</p>
                </Link>
            </nav>
        );
    }

    return (
        <header className={`z-[155] fixed top-0 left-0 right-0 bg-transparent ${isDarkMode ? 'text-white' : 'text-black'}`}>
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
                        <h1 className={`text-xl sm:text-2xl goldGradient font-medium ${poppins.className}`}>
                            CadexLaw
                        </h1>
                        <span className={`ml-2 px-2 py-1 text-xs rounded ${isDarkMode ? 'bg-emerald-600 text-white' : 'bg-emerald-400 text-white'}`}>Demo Build</span>
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
                <div 
                    className={`absolute md:hidden top-full left-4 right-4 pt-4 z-50 drop-down-animation 
                    flex flex-col gap-2 rounded-2xl shadow-lg transition-all duration-300 
                    ${isDarkMode ? 'bg-blue-950 text-white border border-slate-700' : 'bg-white text-black border border-gray-200'}`}
                >
                    <div className={`flex flex-col p-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                        {menuActions}
                    </div>
                </div>
            )}
        </header>
    );
}
