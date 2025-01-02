'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Button from './Button';
import { Poppins } from 'next/font/google';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AuthError from './AuthError';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '100', '200', '300', '500', '600', '700'],
});

export default function Login() {
  const router = useRouter();
  const [authenticating, setAuthenticating] = useState(false);
  const [error, setError] = useState(null);

  const { demoLogin } = useAuth();

  // ---------------------------------------
  // Disclaimer logic
  // ---------------------------------------
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    const hasSeenDisclaimer = localStorage.getItem('hasSeenDisclaimer');
    if (!hasSeenDisclaimer) {
      setShowDisclaimer(true);
    }
  }, []);

  const handleCloseDisclaimer = () => {
    setShowDisclaimer(false);
    localStorage.setItem('hasSeenDisclaimer', 'true');
  };

  // ---------------------------------------
  // Handle Demo Login Submission
  // ---------------------------------------
  async function handleBegin() {
    if (authenticating) return;
    setError(null);
    setAuthenticating(true);

    try {
      // No code required. Demo login defaults to demo rank and default@default.com
      await demoLogin();
      router.push('/ailawtools/splash'); // Redirect after successful login
    } catch (err) {
      console.error(err.message);
      setError(err.message);
    } finally {
      setAuthenticating(false);
    }
  }

  return (
    <>
      {/* Disclaimer Popup */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-[151] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg mx-auto">
            <h2 className="text-3xl font-semibold mb-4 text-gray-900 dark:text-white">
              Important Disclaimer
            </h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Please note that Cadex is a supplementary tool and not a substitute for
              professional legal advice or formal exams. Verify all information and refer
              to our{' '}
              <Link legacyBehavior href="/legal">
                <a className="text-blue-600 underline dark:text-blue-400">Terms and Conditions</a>
              </Link>
              .
            </p>
            <div className="text-right">
              <button
                onClick={handleCloseDisclaimer}
                className="group before:ease relative h-12 w-56 overflow-hidden rounded bg-gradient-to-r from-blue-950 to-slate-700 text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-56"
              >
                <div className="flex items-center justify-center h-full">
                  I Understand
                  <i className="ml-8 fa-solid fa-arrow-right opacity-0 group-hover:opacity-100 transition-opacity duration-200"></i>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Content */}
      <div className="flex flex-col gap-6 items-center sm:flex-row sm:justify-center sm:items-center py-10">
        <Image
          src="/header.avif"
          alt="CadexLaw Logo"
          width={120}
          height={120}
          className="w-24 h-24 sm:mr-4 mb-4"
          unoptimized={true}
        />
        <div className="text-center sm:text-left">
          <h2
            className={
              'text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold ' +
              poppins.className
            }
          >
            <span className="goldGradient">CadexLaw</span>
          </h2>
        </div>
      </div>
      <div className="flex flex-col gap-4 text-base sm:text-lg">
        {error && <AuthError errMessage={error} />}
        <div
          className={
            'flex items-stretch gap-4 max-w-[400px] mx-auto w-full duration-200 ' +
            (authenticating ? ' cursor-not-allowed opacity-60 ' : ' ')
          }
        >
          <Button
            text={'Start Demo'}
            saving={authenticating ? 'Starting...' : ''}
            clickHandler={handleBegin}
          />
        </div>
        <p className="mx-auto text-sm sm:text-base my-4">
          Prefer the real app?{' '}
          <a
            className="goldGradient pl-2"
            href="https://cadexlaw.com/register"
            target="_blank"
            rel="noopener noreferrer"
          >
            Sign up
          </a>
        </p>
      </div>
    </>
  );
}
