'use client';
import { db } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import Link from 'next/link';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

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
            !userDataObj?.billing?.stripeCustomerId ||
            userDataObj?.billing?.plan !== 'Pro'
        ) {
            alert('No active Pro subscription found.');
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
        <div className='flex flex-1 items-center justify-center flex-col gap-8 pb-20 bg-white rounded-xl'>
            <p className='text-center text-xl sm:text-2xl md:text-3xl text-blue-950'>
                We are sorry to see you go
            </p>
            <p>Did we help with your pursuit of Law?</p>
            <div className='grid grid-cols-2 gap-4'>
                <button
                    onClick={() => setHelped('no')}
                    className={`px-4 py-2 rounded ${
                        helped === 'no' ? 'bg-red-500 text-white' : 'bg-gray-200'
                    }`}
                >
                    No {helped === 'no' && '🥲'}
                </button>
                <button
                    onClick={() => setHelped('yes')}
                    className={`px-4 py-2 rounded ${
                        helped === 'yes' ? 'bg-green-500 text-white' : 'bg-gray-200'
                    }`}
                >
                    Yes {helped === 'yes' && ''}
                </button>
            </div>
            <div className='flex items-center gap-4'>
                <Link
                    href='/admin/account'
                    className='flex items-center justify-center gap-2 border border-solid border-blue-950 bg-white px-4 py-2 rounded text-blue-950 duration-200 hover:opacity-50'
                >
                    <p>Back to home</p>
                    <i className='fa-solid fa-home'></i>
                </Link>
                <button
                    onClick={handlePlanCancellation}
                    disabled={!helped || loading}
                    className={`px-4 py-2 rounded bg-red-500 text-white duration-200 ${
                        !helped || loading
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-red-600'
                    }`}
                >
                    {loading ? 'Cancelling...' : 'Confirm cancellation'}
                </button>
            </div>
            {error && <p className='text-red-500 mt-4'>{error}</p>}
        </div>
    );
}
