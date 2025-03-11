'use client';
import React, { useState } from 'react';
import Image from 'next/image'; // Import Image from next/image
import { Poppins } from 'next/font/google';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/firebase';
import { useAuth } from '@/context/AuthContext';
import Button from './Button';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '100', '200', '300', '500', '600', '700'],
});

export default function ForgotPassword() {
  const { userDataObj } = useAuth();
  const isDarkMode = userDataObj?.darkMode || false;

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setSending(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('A password reset email has been sent. Remember to check your Spam/Junk folder!');
    } catch (err) {
      console.error(err);
      setError('Failed to send reset email. Please try again later.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`flex flex-col gap-6 p-6 ${poppins.className}`}>
      <Image
        src="/header.avif"
        alt="Header"
        width={100}
        height={100}
        className="mx-auto"
        unoptimized={true}
      />
      <h1
        className={`text-3xl font-semibold text-center ${
          isDarkMode ? 'text-white' : 'text-blue-950'
        } goldGradient`}
      >
        Forgot Password
      </h1>
      <p
        className={`text-base text-center ${
          isDarkMode ? 'text-white' : 'text-black'
        }`}
      >
        Enter your email address below and we’ll send you a link to reset your
        password.
      </p>
      <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-white border border-solid rounded-full p-4 max-w-[600px] mx-auto w-full outline-none"
        />
        <div
          className={
            'flex items-stretch gap-4 max-w-[600px] mx-auto w-full duration-200 ' +
            (sending ? ' cursor-not-allowed opacity-60 ' : ' ')
          }
        >
          <Button
            text={'Reset Password'}
            saving={sending ? 'Sending...' : ''}
            clickHandler={handleResetPassword}
          />
        </div>
      </form>
      {message && <p className="text-center text-green-500">{message}</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      <p
        className={`text-center mt-4 ${
          isDarkMode ? 'text-white' : 'text-blue-950'
        }`}
      >
        Remember your password?{' '}
        <a href="/admin/account" className="goldGradient pl-2 hover:opacity-50">
          Login
        </a>
      </p>
    </div>
  );
}
