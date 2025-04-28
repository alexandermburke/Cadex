'use client';
import { Poppins } from 'next/font/google';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import Button from './Button';
import { FaBars, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const poppins = Poppins({ subsets: ["latin"], weight: ['400', '100', '200', '300', '500', '600', '700'] });

const hideHeaderDesktop = false;

export default function Header() {
  const { currentUser, logout, userDataObj } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showText, setShowText] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isDarkMode = userDataObj?.darkMode || false;
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  const shouldRenderHeader = !(hideHeaderDesktop && isDesktop);

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
    await new Promise((r) => setTimeout(r, 2000));
    setShowText(false);
  }

  let shareBtn = (
    <div className="flex flex-col relative">
    </div>
  );

  const carouselItems = [
    { href: '/casebriefs/allbriefs', label: 'All Briefs' },
    { href: '/casebriefs/analysis', label: 'Case Analysis' },
    { href: '/casebriefs/summaries', label: 'Case Summaries' }
  ];
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex((prevIndex) => (prevIndex + 1) % carouselItems.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [carouselItems.length]);

  let navActions = (
    <nav className="hidden items-stretch md:flex">
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
    <nav className="flex flex-col gap-2">
      <Link
        className={`p-2 rounded-lg border-solid border duration-200 text-lg border-blue-950 border-x-4 border-y-4 
          ${isDarkMode ? 'hover:text-slate-500 hover:bg-blue-950 text-white' : 'hover:text-slate-500 hover:bg-blue-950 text-black'}`}
        href={'/ailawtools/splash'}
      >
        <p>Dashboard</p>
      </Link>
      <Link
        className={`p-2 rounded-lg border-solid border duration-200 text-lg border-blue-950 border-x-4 border-y-4 
          ${isDarkMode ? 'hover:text-slate-500 hover:bg-blue-950 text-white' : 'hover:text-slate-500 hover:bg-blue-950 text-black'}`}
        href={'/admin/account'}
      >
        <p>Account</p>
      </Link>
      <Link
        className={`p-2 rounded-lg border-solid border duration-200 text-lg border-blue-950 border-x-4 border-y-4 
          ${isDarkMode ? 'hover:text-slate-500 hover:bg-blue-950 text-white' : 'hover:text-slate-500 hover:bg-blue-950 text-black'}`}
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
        <div className="hidden items-stretch md:flex">
          {/* Replace the "Case Briefs" link with a carousel */}
          <Link
            href={carouselItems[carouselIndex].href}
            className={`border border-solid duration-200 border-transparent px-4 grid place-items-center rounded ${
              isDarkMode ? 'hover:text-slate-500' : 'hover:text-slate-200'
            } text-${isDarkMode ? 'white' : 'black'}`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={carouselItems[carouselIndex].label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
                exit={{ opacity: 0, y: -20, transition: { duration: 0.5, delay: 3 } }}
                className="flex items-center"
              >
                <span>{carouselItems[carouselIndex].label}</span>
              </motion.div>
            </AnimatePresence>
          </Link>
          <Link
            href={'/ailawtools/splash'}
            className={`border border-solid duration-200 border-transparent px-4 grid place-items-center rounded
              ${isDarkMode ? 'hover:text-slate-500' : 'hover:text-slate-200'} text-${
              isDarkMode ? 'white' : 'black'
            }`}
          >
            <div className="flex items-center">
              <p>Dashboard</p>
              <span
                className={`ml-2 px-2 py-1 text-xs rounded ${
                  isDarkMode ? 'bg-emerald-600 text-white' : 'bg-emerald-400 text-white'
                }`}
              >
                Beta
              </span>
            </div>
          </Link>
          <Link
            href={'/admin/account'}
            className={`border border-solid duration-200 border-transparent px-4 grid place-items-center rounded
              ${isDarkMode ? 'hover:text-slate-500' : 'hover:text-slate-200'} text-${
              isDarkMode ? 'white' : 'black'
            }`}
          >
            <p>Account</p>
          </Link>
          <button
            onClick={logout}
            className={`border border-solid duration-200 border-transparent px-4 grid place-items-center rounded
              ${isDarkMode ? 'hover:text-slate-500' : 'hover:text-slate-200'} text-${
              isDarkMode ? 'white' : 'black'
            }`}
          >
            <p>Logout</p>
          </button>
          {shareBtn}
        </div>
      </>
    );
    menuActions = (
      <nav className="flex flex-col gap-2">
        <Link
          href={'/ailawtools/splash'}
          className={`p-2 rounded-lg border-solid border duration-200 text-lg border-blue-950 border-x-4 border-y-4
            ${isDarkMode ? 'hover:text-slate-500 hover:bg-blue-950 text-white' : 'hover:text-slate-500 hover:bg-blue-950 text-black'}`}
        >
          <div className="flex items-center">
            <p>Dashboard</p>
            <span
              className={`ml-2 px-2 py-1 text-xs rounded ${
                isDarkMode ? 'bg-emerald-600 text-white' : 'bg-emerald-400 text-white'
              }`}
            >
              Beta
            </span>
          </div>
        </Link>
        <Link
          href={'/casebriefs/allbriefs'}
          className={`p-2 rounded-lg border-solid border duration-200 text-lg border-blue-950 border-x-4 border-y-4
            ${isDarkMode ? 'hover:text-slate-500 hover:bg-blue-950 text-white' : 'hover:text-slate-500 hover:bg-blue-950 text-black'}`}
        >
          <p>Case Briefs</p>
        </Link>
        <Link
          href={'/admin/account'}
          className={`p-2 rounded-lg border-solid border duration-200 text-lg border-blue-950 border-x-4 border-y-4
            ${isDarkMode ? 'hover:text-slate-500 hover:bg-blue-950 text-white' : 'hover:text-slate-500 hover:bg-blue-950 text-black'}`}
        >
          <p>Account</p>
        </Link>
        <button
          className={`p-2 text-left rounded border-solid border duration-200 text-lg border-blue-950 border-x-4 border-y-4
            ${isDarkMode ? 'hover:text-slate-500 hover:bg-blue-950 text-white' : 'hover:text-slate-500 hover:bg-blue-950 text-black'}`}
          onClick={logout}
        >
          <p>Logout</p>
        </button>
        {shareBtn}
      </nav>
    );
  }

  return (
    <>
      {shouldRenderHeader && (
        <header
          className={`z-[155] fixed top-0 left-0 right-0 bg-transparent ${
            isDarkMode ? 'text-white' : 'text-black'
          }`}
        >
          <div className="flex items-center justify-between gap-4 max-w-[1400px] mx-auto w-full overflow-hidden p-2 drop-shadow-sm">
            <Link href={'/'}>
              <div className="flex items-center gap-2">
                <Image
                  src="/header.avif"
                  alt="CadexLaw Logo"
                  width={44}
                  height={44}
                  className={`${logoLoaded ? 'logo-animation' : 'w-12 h-12'}`}
                  unoptimized={true}
                  quality={'100'}
                />
                <h1 className={`text-xl sm:text-2xl goldGradient font-medium ${poppins.className}`}>
                  CadexLaw
                </h1>
              </div>
            </Link>
            {navActions}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="grid md:hidden place-items-center p-4 duration-200 rounded-lg"
            >
              <AnimatePresence mode="wait" initial={false}>
                {showMenu ? (
                  <motion.div
                    key="close-icon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FaTimes className="text-lg" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="bars-icon"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FaBars className="text-lg" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>

          {showMenu && (
            <div
              className={`absolute md:hidden top-full left-4 right-4 pt-4 z-50 drop-down-animation flex flex-col gap-2 rounded-2xl shadow-lg transition-all duration-300 ${
                isDarkMode ? 'bg-blue-950 text-white border border-slate-700' : 'bg-white text-black border border-gray-200'
              }`}
            >
              <div className={`flex flex-col p-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>{menuActions}</div>
            </div>
          )}
        </header>
      )}
    </>
  );
}
