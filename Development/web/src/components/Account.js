'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import ActionCard from './ActionCard';
import { useAuth } from '@/context/AuthContext';
import LogoFiller from './LogoFiller';
import { getAuth } from 'firebase/auth';

export default function Account() {
    const { currentUser, userDataObj } = useAuth();
    const [subscriptionData, setSubscriptionData] = useState({
        nextPaymentDate: null,
        amountDue: null,
        currency: null,
        status: null,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const auth = getAuth();

    // Get the user's plan from billing information or default to 'Free'
    const plan = userDataObj?.billing?.plan || 'Free';

    useEffect(() => {
        async function fetchSubscriptionData() {
            if (!currentUser?.uid || !userDataObj?.billing?.stripeCustomerId) {
                setLoading(false);
                return;
            }

            try {
                // Get the ID token
                const idToken = await currentUser.getIdToken();

                const response = await fetch('/api/get-subscription', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${idToken}`,
                    },
                    body: JSON.stringify({
                        stripeCustomerId: userDataObj.billing.stripeCustomerId,
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    // Convert Unix timestamp to readable date
                    const nextPayment = new Date(data.nextPaymentDue * 1000);
                    setSubscriptionData({
                        nextPaymentDate: nextPayment.toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        }),
                        amountDue: data.amountDue
                            ? (data.amountDue / 100).toFixed(2) // Assuming amount is in cents
                            : null,
                        currency: data.currency ? data.currency.toUpperCase() : null,
                        status: data.status || 'Inactive',
                    });
                } else {
                    console.error('Error fetching subscription data:', data.error);
                    setError(data.error || 'Failed to fetch subscription data');
                }
            } catch (error) {
                console.error('Error fetching subscription data:', error);
                setError('Failed to fetch subscription data');
            } finally {
                setLoading(false);
            }
        }

        fetchSubscriptionData();
    }, [currentUser?.uid, userDataObj?.billing?.stripeCustomerId, currentUser]);

    // User account details
    const vals = {
        email: currentUser.email,
        username: currentUser.displayName,
        cases: Object.keys(userDataObj?.listings || {}).length,
        link: 'www.cadexlaw.com/' + currentUser.displayName,
    };

    // Billing information with updated actions and next payment details
    const billingObj = {
        current_plan: plan,
        status: subscriptionData.status || (userDataObj?.billing?.status ? 'Active' : 'Inactive'),
        next_payment_due: loading
            ? 'Loading...'
            : error
            ? `Error: ${error}`
            : subscriptionData.nextPaymentDate
            ? subscriptionData.nextPaymentDate
            : 'Not Available',
        amount_due: loading
            ? 'Loading...'
            : error
            ? 'N/A'
            : subscriptionData.amountDue && subscriptionData.currency
            ? `${subscriptionData.amountDue} ${subscriptionData.currency}`
            : 'N/A',
        actions: (
            <div className="flex flex-col gap-2">
                  {(plan === 'Basic' || plan === 'Free') && (
                    <Link
                        href="/admin/billing"
                        className="group before:ease relative h-12 w-56 overflow-hidden rounded goldBackground text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-56">
                        <div className="flex items-center justify-center h-full">
                            Upgrade Account
                                <i className="ml-8 fa-solid fa-arrow-right opacity-0 group-hover:opacity-100 transition-opacity duration-200"></i>
                              </div>
                    </Link>
                )}
                {(plan === 'Pro' || plan === 'Basic') && (
                    <Link
                        href="/admin/billing/cancel_subscription"
                        className="group before:ease relative h-12 w-56 overflow-hidden rounded bg-transparent text-blue-950 transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-transparent before:opacity-20 before:duration-700 hover:before:-translate-x-56">
                        <div className="flex items-center justify-center h-full">
                          Cancel Subscription
                                <i className="ml-8 fa-solid fa-arrow-right opacity-0 group-hover:opacity-100 transition-opacity duration-200"></i>
                              </div>
                    </Link>
                )}   
            </div>
        ),
    };

    return (
        <>
            <div className="flex flex-col gap-8 flex-1">
                <div className="flex items-center justify-between gap-4">
                    <Link
                        href="/ailawtools/examprep"
                        className="flex items-center mr-auto justify-center gap-4 bg-red-600 px-4 py-2 rounded text-white duration-200 hover:opacity-50"
                    >
                        <p>&larr; Back</p>
                    </Link>
                </div>
                <ActionCard title="Account Details">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.keys(vals).map((entry, entryIndex) => (
                            <div className="flex items-center gap-4" key={entryIndex}>
                                <p className="font-medium w-24 sm:w-32 capitalize">
                                    {entry.replaceAll('_', ' ')}
                                </p>
                                <p>{vals[entry]}</p>
                            </div>
                        ))}
                    </div>
                </ActionCard>
                <ActionCard title="Billing & Plan">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.keys(billingObj).map((entry, entryIndex) => (
                            <div className="flex items-center gap-4" key={entryIndex}>
                                <p className="font-medium w-24 sm:w-32 capitalize">
                                    {entry.replaceAll('_', ' ')}
                                </p>
                                {entry === 'actions' ? (
                                    billingObj[entry]
                                ) : entry === 'current_plan' ? (
                                    <p
                                        className={`px-2 py-1 rounded-full capitalize text-xs ${
                                            plan === 'Pro'
                                                ? 'bg-blue-100 text-blue-700'
                                                : plan === 'Basic'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                        }`}
                                    >
                                        {billingObj[entry]}
                                    </p>
                                ) : (
                                    <p>
                                        {billingObj[entry]}
                                        {entry === 'next_payment_due' && subscriptionData.amountDue && (
                                            <span className="ml-2 text-sm text-gray-500">
                                                ({billingObj.amount_due})
                                            </span>
                                        )}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </ActionCard>
                {!loading && !error && subscriptionData.amountDue && (
                    <ActionCard title="Payment History">
                        <Link
                            href="/admin/billing/payment_history"
                            className="duration-200 hover:opacity-60 goldGradient"
                        >
                            <p>View Payment History &rarr;</p>
                        </Link>
                    </ActionCard>
                )}
            </div>
            <LogoFiller />
        </>
    );
}
