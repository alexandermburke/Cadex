// pages/forgot-password.js

'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AuthError from './AuthError';
import Button from './Button';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { sendPasswordResetEmail } = useAuth(); // Ensure this function exists in AuthContext
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setMessage('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(email);
      setMessage('Password reset email sent. Check your inbox.');
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h2 className="text-3xl font-semibold mb-6">Reset Your Password</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
        {error && <AuthError errMessage={error} />}
        {message && <p className="text-green-500">{message}</p>}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-white rounded-lg border border-gray-300 p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your email"
        />
        <Button
          text={loading ? 'Sending...' : 'Send Reset Email'}
          saving={loading ? 'Sending...' : ''}
          clickHandler={handleSubmit}
          type="submit"
          disabled={loading}
        />
        <p className="text-sm text-center">
          Remembered your password?{' '}
          <Link className="goldGradient pl-2 hover:underline" href="/login">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
