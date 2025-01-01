'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // <-- Import the hook
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
  const router = useRouter(); // <-- Initialize router
  const [code, setCode] = useState('');
  const [authenticating, setAuthenticating] = useState(false);
  const [error, setError] = useState(null);

  const { demoLogin } = useAuth();

  async function handleSubmit() {
    if (authenticating) return;
    setError(null);
    setAuthenticating(true);

    try {
      await demoLogin(code);
      router.push('/ailawtools/splash');
    } catch (err) {
      console.error(err.message);
      setError(err.message);
    } finally {
      setAuthenticating(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-6 items-center sm:flex-row sm:justify-center sm:items-center py-10">
        <Image
          src="/header.avif"
          alt="CadexLaw Logo"
          width={144}
          height={144}
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
      <div className="flex flex-col gap-2 items-center sm:flex-row sm:justify-center sm:items-center">
        <p>Enter your demo code!</p>
      </div>
      <div className="flex flex-col gap-4 text-base sm:text-lg">
        {error && <AuthError errMessage={error} />}
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 bg-white rounded max-w-[600px] mx-auto w-full outline-none border border-solid border-white p-4"
          placeholder="Demo Code (e.g. 1234)"
        />
        <div
          className={
            'flex items-stretch gap-4 max-w-[600px] mx-auto w-full duration-200 ' +
            (authenticating ? ' cursor-not-allowed opacity-60 ' : ' ')
          }
        >
          <Button
            text={'Submit'}
            saving={authenticating ? 'Submitting' : ''}
            clickHandler={handleSubmit}
          />
        </div>
        <p className="mx-auto text-sm sm:text-base">
          Prefer the real app?{' '}
          <Link className="goldGradient pl-2" href={'/register'}>
            Sign up
          </Link>
        </p>
      </div>
    </>
  );
}
