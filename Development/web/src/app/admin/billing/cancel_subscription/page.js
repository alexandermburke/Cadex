// app/components/CancelPage.js

'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Button from '@/components/Button';
import { Poppins } from 'next/font/google';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '100', '200', '300', '500', '600', '700'],
});

export default function CancelPage() {
  const [helped, setHelped] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { currentUser, userDataObj, setUserDataObj } = useAuth();

  async function handlePlanCancellation() {
    if (!helped) {
      alert('Please let us know if we helped you on your job search.');
      return;
    }
    if (
      !userDataObj?.billing?.stripeCustomerId
    ) {
      alert('No active subscription found.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stripeCustomerId: userDataObj.billing.stripeCustomerId,
          userId: currentUser.uid,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update user's billing status in Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          'billing.status': 'Cancelled',
        });

        // Update local user data
        const updatedBilling = {
          ...userDataObj.billing,
          status: 'Cancelled',
        };
        const firebaseData = {
          ...userDataObj,
          billing: updatedBilling,
        };
        setUserDataObj(firebaseData);
        localStorage.setItem('hyr', JSON.stringify(firebaseData));

        alert('Your subscription has been cancelled.');
        router.push('/admin/account');
      } else {
        console.error('Error cancelling subscription:', data.error);
        setError(data.error || 'Failed to cancel subscription.');
      }
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Header Section */}
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

      {/* Main Content */}
      <div className="flex flex-col gap-8 items-center justify-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h3 className="text-2xl sm:text-3xl font-semibold text-blue-950">
          We are sorry to see you go
        </h3>

        <p className="text-center text-gray-700">
          Did we help with your pursuit of Law?
        </p>

        {/* Feedback Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setHelped('no')}
            className={`px-4 py-2 rounded-full transition-colors duration-200 ${
              helped === 'no'
                ? 'bg-red-500 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-red-400'
            }`}
          >
            No {helped === 'no' && '🥲'}
          </button>
          <button
            onClick={() => setHelped('yes')}
            className={`px-4 py-2 rounded-full transition-colors duration-200 ${
              helped === 'yes'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-green-400'
            }`}
          >
            Yes {helped === 'yes' && '😊'}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Link
            href="/admin/account"
            className="flex items-center justify-center gap-2 border border-solid border-blue-950 bg-white px-4 py-2 rounded-full text-blue-950 transition-opacity duration-200 hover:opacity-50"
          >
            <p>Back to Account</p>
            <i className="fa-solid fa-home"></i>
          </Link>
          <button
            onClick={handlePlanCancellation}
            disabled={!helped || loading}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-red-500 text-white transition-colors duration-200 ${
              !helped || loading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-red-600'
            }`}
          >
            {loading ? 'Cancelling...' : 'Confirm Cancellation'}
          </button>
        </div>
      </div>
    </>
  );
}
