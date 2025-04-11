import React, { useState } from 'react';
import Image from 'next/image'; // Import Image from next/image
import Button from './Button';
import { Poppins } from 'next/font/google';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AuthError from './AuthError';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '100', '200', '300', '500', '600', '700'],
});

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authenticating, setAuthenticating] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();

  async function handleSubmit() {
    if (authenticating) {
      return;
    }
    setError(false);
    setAuthenticating(true);
    try {
      await login(email, password);
    } catch (err) {
      console.log(err.message);
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
          width={520} 
          height={520} 
          className="w-24 h-24 sm:mr-4 mb-4"
          quality={'100'}
          unoptimized={true}
        />
        <div className="text-center sm:text-left">
          <h2
            className={
              'text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold ' +
              poppins.className
            }
          >
            <span className="goldSolid">CadexLaw</span>
          </h2>
        </div>
      </div>
      <div className="flex flex-col gap-2 items-center sm:flex-row sm:justify-center sm:items-center">
        <p>Login to your account!</p>
      </div>
      <div className="flex flex-col gap-4 text-base sm:text-lg">
        {error && <AuthError errMessage={error} />}
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 bg-white max-w-[600px] mx-auto w-full outline-none border border-solid rounded-full border-white p-4"
          placeholder="Email"
        />
        <div className="relative max-w-[600px] mx-auto w-full">
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? 'text' : 'password'}
            className="flex-1 bg-white w-full outline-none border border-solid rounded-full border-white p-4 pr-12"
            placeholder="Password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-4 flex items-center transition-transform duration-200 hover:scale-110"
          >
            {showPassword ? (
              <FaEyeSlash className="h-5 w-5" />
            ) : (
              <FaEye className="h-5 w-5" />
            )}
          </button>
        </div>
        <div className="text-center">
          <Link href="/forgotpassword" className="text-blue-500 hover:underline">
            Forgot Password?
          </Link>
        </div>
        <div
          className={
            'flex items-stretch gap-4 max-w-[600px] mx-auto w-full duration-200 my-2' +
            (authenticating ? ' cursor-not-allowed opacity-60 ' : ' ')
          }
        >
          <Button
            text={'Submit'}
            saving={authenticating ? 'Submitting' : ''}
            clickHandler={handleSubmit}
            className="my-2"
          />
        </div>
        <p className="mx-auto text-sm sm:text-base">
          Don&apos;t have an account?{' '}
          <Link className="goldGradient pl-2 hover:opacity-50" href={'/register'}>
            Sign up
          </Link>
        </p>
      </div>
    </>
  );
}
