// components/Account.js

'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import ActionCard from './ActionCard';
import { useAuth } from '@/context/AuthContext';
import LogoFiller from './LogoFiller';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';

export default function Account() {
    const { currentUser, userDataObj, refreshUserData } = useAuth();

    // --------------------------
    // Local subscription/billing state
    // --------------------------
    const [subscriptionData, setSubscriptionData] = useState({
        plan: userDataObj?.billing?.plan || 'Free',
        status: 'Inactive',
        nextPaymentDue: null,
        amountDue: null,
        currency: null,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --------------------------
    // Local settings states
    // --------------------------
    const [isDarkMode, setIsDarkMode] = useState(userDataObj?.darkMode || false);
    const [emailNotifications, setEmailNotifications] = useState(
        userDataObj?.emailNotifications || true
    );

    // --------------------------
    // Grab the subscription plan
    // --------------------------
    const plan = subscriptionData.plan || 'Free';

    // --------------------------
    // Fetch subscription data
    // --------------------------
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

    // --------------------------
    // Sync local dark mode state with userDataObj
    // --------------------------
    useEffect(() => {
        setIsDarkMode(userDataObj?.darkMode || false);
        setEmailNotifications(userDataObj?.emailNotifications || false);
    }, [userDataObj?.darkMode, userDataObj?.emailNotifications]);

    // --------------------------
    // Account & Billing values
    // --------------------------
    const vals = {
        email: currentUser?.email || 'Not available',
        username: currentUser?.displayName || 'Not available',
        cases: Object.keys(userDataObj?.listings || {}).length || 0,
        link: currentUser?.displayName
            ? `www.cadexlaw.com/${currentUser.displayName}`
            : 'Not available',
    };

    let paymentDueDisplay = 'N/A';
    if (loading) {
        paymentDueDisplay = 'Loading...';
    } else if (error) {
        paymentDueDisplay = `Error: ${error}`;
    } else if (subscriptionData.nextPaymentDue) {
        paymentDueDisplay = new Date(subscriptionData.nextPaymentDue * 1000).toLocaleDateString();
    }

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
        payment_due: paymentDueDisplay,
        amount_due: amountDueDisplay,
        actions: (
            <div className="flex flex-col gap-2">
                {(plan === 'Basic' || plan === 'Free') && (
                    <Link
                        href="/admin/billing"
                        className={`group relative h-12 w-56 overflow-hidden rounded bg-transparent transition-all 
                            before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 
                            before:rotate-6 before:bg-transparent before:opacity-20 before:duration-700 
                            hover:before:-translate-x-56 ${
                                isDarkMode ? 'text-white' : 'text-blue-950'
                            }`}
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
                        className={`group relative h-12 w-56 overflow-hidden rounded bg-transparent transition-all 
                            before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 
                            before:rotate-6 before:bg-transparent before:opacity-20 before:duration-700 
                            hover:before:-translate-x-56 ${
                                isDarkMode ? 'text-white' : 'text-blue-950'
                            }`}
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

    // --------------------------
    // Styling for current plan
    // --------------------------
    const currentPlanClasses = (() => {
        if (plan === 'Pro' || plan === 'Developer') {
            return 'bg-blue-100 text-blue-700';
        } else if (plan === 'Basic') {
            return 'bg-green-100 text-green-700';
        } else {
            return isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700';
        }
    })();

    // --------------------------
    // Handlers for toggles
    // --------------------------
    const handleDarkModeToggle = async (e) => {
        const newDarkMode = e.target.checked;
        setIsDarkMode(newDarkMode);

        if (!currentUser?.uid) {
            alert('You need to be logged in to update your settings.');
            return;
        }

        try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userDocRef, {
                darkMode: newDarkMode,
            });
            await refreshUserData();
        } catch (updateError) {
            console.error('Error updating dark mode preference:', updateError);
            alert('Failed to update dark mode preference.');
            setIsDarkMode(!newDarkMode);
        }
    };

    const handleEmailNotificationsToggle = async (e) => {
        const newValue = e.target.checked;
        setEmailNotifications(newValue);

        if (!currentUser?.uid) {
            alert('You need to be logged in to update your settings.');
            return;
        }

        try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userDocRef, {
                emailNotifications: newValue,
            });
            await refreshUserData();
        } catch (updateError) {
            console.error('Error updating email notifications:', updateError);
            alert('Failed to update email notifications.');
            setEmailNotifications(!newValue);
        }
    };

    // --------------------------
    // Render
    // --------------------------
    return (
        <div className={`flex flex-col gap-8 flex-1 ${isDarkMode ? 'text-white' : 'text-black'}`}>
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
                                    className={`px-2 py-1 rounded-full capitalize text-xs ${currentPlanClasses}`}
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

            <ActionCard title="Settings">
                {/* Dark Mode Toggle */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="relative inline-block w-14 h-8 select-none transition duration-200 ease-in">
                        <input
                            type="checkbox"
                            name="darkModeToggle"
                            id="darkModeToggle"
                            checked={isDarkMode}
                            onChange={handleDarkModeToggle}
                            className="toggle-checkbox absolute h-0 w-0 opacity-0"
                        />
                        <label
                            htmlFor="darkModeToggle"
                            className="toggle-label block overflow-hidden h-8 rounded-full bg-gray-300 cursor-pointer"
                        ></label>
                    </div>
                    <label htmlFor="darkModeToggle" className="cursor-pointer">
                        Enable Dark Mode
                    </label>
                </div>

                {/* Email Notifications Toggle */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="relative inline-block w-14 h-8 select-none transition duration-200 ease-in">
                        <input
                            type="checkbox"
                            name="emailNotificationsToggle"
                            id="emailNotificationsToggle"
                            checked={emailNotifications}
                            onChange={handleEmailNotificationsToggle}
                            className="toggle-checkbox absolute h-0 w-0 opacity-0"
                        />
                        <label
                            htmlFor="emailNotificationsToggle"
                            className="toggle-label block overflow-hidden h-8 rounded-full bg-gray-300 cursor-pointer"
                        ></label>
                    </div>
                    <label htmlFor="emailNotificationsToggle" className="cursor-pointer">
                        Enable Email Notifications
                    </label>
                </div>
            </ActionCard>

            <LogoFiller />
        </div>
    );
}
