'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import ActionCard from './ActionCard';
import { useAuth } from '@/context/AuthContext';
import LogoFiller from './LogoFiller';

export default function Account() {
    const { currentUser, userDataObj } = useAuth();
    const [subscriptionData, setSubscriptionData] = useState({
        plan: userDataObj?.billing?.plan || 'Free',
        status: 'Inactive',
        nextPaymentDue: null,
        amountDue: null,
        currency: null,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const plan = subscriptionData.plan || 'Free';

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
                    plan: billing.plan || 'Free',
                    status: billing.status || 'Inactive',
                    nextPaymentDue: billing.nextPaymentDue, // Unix timestamp or null
                    amountDue: billing.amountDue ? (billing.amountDue / 100).toFixed(2) : null,
                    currency: billing.currency || null,
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
        link: currentUser?.displayName
            ? `www.cadexlaw.com/${currentUser.displayName}`
            : 'Not available',
    };

    // Determine what to display for payment due
    let paymentDueDisplay = 'N/A';
    if (loading) {
        paymentDueDisplay = 'Loading...';
    } else if (error) {
        paymentDueDisplay = `Error: ${error}`;
    } else if (subscriptionData.nextPaymentDue) {
        paymentDueDisplay = new Date(subscriptionData.nextPaymentDue * 1000).toLocaleDateString();
    }

    // Determine what to display for amount due
    let amountDueDisplay = 'N/A';
    if (loading) {
        amountDueDisplay = 'Loading...';
    } else if (error) {
        amountDueDisplay = 'N/A';
    } else if (subscriptionData.amountDue && subscriptionData.currency) {
        amountDueDisplay = `${subscriptionData.amountDue} ${subscriptionData.currency}`;
    }

    const billingObj = {
        current_plan: plan,
        status: subscriptionData.status || 'Inactive',
        payment_due: paymentDueDisplay, // Actual date or 'N/A' or status
        amount_due: amountDueDisplay,
        actions: (
            <div className="flex flex-col gap-2">
                {(plan === 'Basic' || plan === 'Free') && (
                    <Link
                        href="/admin/billing"
                        className="group before:ease relative h-12 w-56 overflow-hidden rounded bg-white text-blue-950 transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-transparent before:opacity-20 before:duration-700 hover:before:-translate-x-56"
                    >
                        <div className="flex items-center justify-center h-full">
                            Upgrade Account
                            <i className="ml-8 fa-solid fa-arrow-right opacity-0 group-hover:opacity-100 transition-opacity duration-200"></i>
                        </div>
                    </Link>
                )}
                {(plan === 'Pro' || plan === 'Basic' || plan === 'Developer') && (
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
                                    {entry.replace('_', ' ')}
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
                                    {entry === 'payment_due' ? 'Payment Due' : entry.replace('_', ' ')}
                                </p>
                                {entry === 'actions' ? (
                                    billingObj[entry]
                                ) : entry === 'current_plan' ? (
                                    <p
                                        className={`px-2 py-1 rounded-full capitalize text-xs ${
                                            plan === 'Pro' || plan === 'Developer'
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
