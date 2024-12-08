'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import ActionCard from './ActionCard';
import { useAuth } from '@/context/AuthContext';
import LogoFiller from './LogoFiller';

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

    const plan = userDataObj?.billing?.plan || 'Free';

    useEffect(() => {
        async function fetchBillingData() {
            if (!currentUser?.uid) {
                console.warn('No current user logged in, skipping billing fetch.');
                setLoading(false);
                return;
            }

            try {
                console.log('Fetching subscription data for userId:', currentUser.uid);
                const response = await fetch('/api/billing', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: currentUser.uid }),
                });

                console.log('Response status:', response.status);

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Error response from /api/billing:', errorData);
                    throw new Error(errorData.error || 'Failed to fetch billing data');
                }

                const { billing } = await response.json();
                console.log('Billing data received:', billing);

                setSubscriptionData({
                    nextPaymentDate: billing.nextPaymentDue
                        ? new Date(billing.nextPaymentDue * 1000).toLocaleDateString()
                        : 'Not Available',
                    amountDue: billing.amountDue ? (billing.amountDue / 100).toFixed(2) : null,
                    currency: billing.currency || null,
                    status: billing.status || 'Inactive',
                });
            } catch (fetchError) {
                console.error('Error fetching billing data:', fetchError.message);
                setError('Failed to fetch subscription data');
            } finally {
                setLoading(false);
            }
        }

        fetchBillingData();
    }, [currentUser?.uid]);

    const vals = {
        email: currentUser?.email || 'Not available',
        username: currentUser?.displayName || 'Not available',
        cases: Object.keys(userDataObj?.listings || {}).length || 0,
        link: currentUser?.displayName ? `www.cadexlaw.com/${currentUser.displayName}` : 'Not available',
    };

    const billingObj = {
        current_plan: plan,
        status: subscriptionData.status || 'Inactive',
        next_payment_due: loading
            ? 'Loading...'
            : error
            ? `Error: ${error}`
            : subscriptionData.nextPaymentDate,
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
                        className="group before:ease relative h-12 w-56 overflow-hidden rounded goldBackground text-white opacity-80 transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-56"
                    >
                        <div className="flex items-center justify-center h-full">
                            Upgrade Account
                            <i className="ml-8 fa-solid fa-arrow-right opacity-0 group-hover:opacity-100 transition-opacity duration-200"></i>
                        </div>
                    </Link>
                )}
                {(plan === 'Pro' || plan === 'Basic') && (
                    <Link
                        href="/admin/billing/cancel_subscription"
                        className="group before:ease relative h-12 w-56 overflow-hidden rounded bg-transparent text-blue-950 transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-transparent before:opacity-20 before:duration-700 hover:before:-translate-x-56"
                    >
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
                                    <p>{billingObj[entry]}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </ActionCard>
            </div>
            <LogoFiller />
        </>
    );
}
