// /components/Account.js
'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import ActionCard from './ActionCard'; // If you still want to use your existing ActionCard
import { useAuth } from '@/context/AuthContext';
import LogoFiller from './LogoFiller';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { sendEmailVerification } from 'firebase/auth';

export default function Account() {
  const { currentUser, userDataObj, refreshUserData } = useAuth();

  // Local subscription/billing state
  const [subscriptionData, setSubscriptionData] = useState({
    plan: userDataObj?.billing?.plan || 'Free',
    status: 'Inactive',
    nextPaymentDue: null,
    amountDue: null,
    currency: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Local settings states
  const [isDarkMode, setIsDarkMode] = useState(userDataObj?.darkMode || false);
  const [emailNotifications, setEmailNotifications] = useState(
    userDataObj?.emailNotifications || true
  );

  // NEW: State to control Update Log modal visibility
  const [showUpdateLog, setShowUpdateLog] = useState(false);

  // Grab the subscription plan
  const plan = subscriptionData.plan || 'Free';

  // Fetch subscription data
  useEffect(() => {
    async function fetchBillingData() {
      if (!currentUser?.uid) {
        console.warn('No current user, skipping billing fetch.');
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
          console.error('Error from /api/billing:', errorData);
          throw new Error(errorData.error || 'Failed to fetch billing data');
        }

        const { billing } = await response.json();
        console.log('Billing data received:', billing);

        setSubscriptionData({
          plan: billing.plan || 'Free',
          status: billing.status || 'Inactive',
          nextPaymentDue: billing.nextPaymentDue, // Unix timestamp
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

  // Sync local dark mode with userDataObj
  useEffect(() => {
    setIsDarkMode(userDataObj?.darkMode || false);
    setEmailNotifications(userDataObj?.emailNotifications || false);
  }, [userDataObj?.darkMode, userDataObj?.emailNotifications]);

  // Basic account details
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
      await updateDoc(userDocRef, { darkMode: newDarkMode });
      await refreshUserData();
    } catch (err) {
      console.error('Error updating dark mode:', err);
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
      await updateDoc(userDocRef, { emailNotifications: newValue });
      await refreshUserData();
    } catch (err) {
      console.error('Error updating email notifications:', err);
      alert('Failed to update email notifications.');
      setEmailNotifications(!newValue);
    }
  };

  // --------------------------
  // Prepare data for rendering
  // --------------------------
  const currentPlan = subscriptionData.plan;
  const planStatus = subscriptionData.status || 'Inactive';

  // Return a color style for the plan badge
  const planBadgeClasses = (() => {
    if (currentPlan === 'Pro' || currentPlan === 'Developer') {
      return 'bg-blue-100 text-blue-700';
    } else if (currentPlan === 'Basic') {
      return 'bg-green-100 text-green-700';
    } else {
      return isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700';
    }
  })();

  // --------------------------
  // Handle Verify Email
  // --------------------------
  const handleSendVerificationEmail = async () => {
    if (!currentUser) {
      alert('No user is logged in.');
      return;
    }
    try {
      await sendEmailVerification(currentUser);
      alert('Verification email sent. Please check your inbox.');
    } catch (err) {
      console.error('Error sending verification email:', err);
      alert('Failed to send verification email. Please try again later.');
    }
  };

  return (
    <div
      className={`flex flex-col w-full gap-8 ${
        isDarkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-blue-950'
      } min-h-screen p-4 sm:p-8 transition-colors duration-300`}
    >
      {/* Hero / Header Section */}
      <section
        className={`w-full p-6 rounded-lg shadow-md transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Left column: Basic Info */}
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">
              Welcome, {currentUser?.displayName || 'Friend'}
            </h1>
            <div className="flex flex-col text-sm space-y-1">
              <p>
                <strong>Email:</strong> {vals.email}
              </p>
              <p>
                <strong>Username:</strong> {vals.username}
              </p>
              <p>
                <strong>Public Link:</strong> {vals.link}
              </p>
            </div>
          </div>
          {/* Right column: Plan & Status */}
          <div className="flex flex-col space-y-2 items-start md:items-end">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase ${planBadgeClasses}`}
            >
              Current Plan: {currentPlan}
            </span>
            <span
              className={`inline-block px-2 py-1 text-xs font-semibold rounded-md ${
                planStatus === 'Active'
                  ? 'bg-green-200 text-green-800'
                  : 'bg-red-200 text-red-800'
              }`}
            >
              Status: {planStatus}
            </span>
            {subscriptionData.nextPaymentDue && (
              <p className="text-sm">
                Next Payment Due: <strong>{paymentDueDisplay}</strong>
              </p>
            )}
            {subscriptionData.amountDue && subscriptionData.currency && (
              <p className="text-sm">
                Amount Due: <strong>{amountDueDisplay}</strong>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Subscription/Billing Card */}
        <section
          className={`col-span-1 xl:col-span-1 p-6 rounded-lg shadow-md transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <h2 className="text-xl font-bold mb-4">Subscription &amp; Billing</h2>
          <div className="flex flex-col gap-2">
            {(plan === 'Basic' || plan === 'Free') && (
              <Link
                href="/admin/billing"
                className={`
                  group relative h-12 w-full sm:w-56 overflow-hidden rounded bg-gradient-to-r
                  from-blue-600 to-blue-800 text-white text-sm sm:text-base shadow hover:opacity-90
                  transition-all duration-200 flex items-center justify-center
                `}
              >
                <span className="font-semibold">Upgrade Account</span>
                <i className="ml-2 fa-solid fa-arrow-right transition-transform duration-300 group-hover:translate-x-1"></i>
              </Link>
            )}
            {(plan === 'Pro' || plan === 'Basic' || plan === 'Developer') && (
              <a
                href="https://billing.stripe.com/p/login/4gwaH17kt3TRbZu5kk"
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  group relative h-12 w-full sm:w-56 overflow-hidden rounded bg-gradient-to-r
                  from-gray-600 to-gray-700 text-white text-sm sm:text-base shadow hover:opacity-90
                  transition-all duration-200 flex items-center justify-center
                `}
              >
                <span className="font-semibold">Cancel Subscription</span>
                <i className="ml-2 fa-solid fa-arrow-right transition-transform duration-300 group-hover:translate-x-1"></i>
              </a>
            )}
          </div>
        </section>

        {/* Settings Card */}
        <section
          className={`col-span-1 xl:col-span-1 p-6 rounded-lg shadow-md transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <h2 className="text-xl font-bold mb-4">Settings</h2>
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between mb-4">
            <label htmlFor="darkModeToggle" className="cursor-pointer font-semibold text-sm">
              Enable Dark Mode
            </label>
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
          </div>

          {/* Email Notifications Toggle */}
          <div className="flex items-center justify-between">
            <label htmlFor="emailNotificationsToggle" className="cursor-pointer font-semibold text-sm">
              Email Notifications
            </label>
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
          </div>

          {/* Verify Email Option (inside settings) */}
          {currentUser && !currentUser.emailVerified && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleSendVerificationEmail}
                className="group relative h-12 w-full sm:w-56 overflow-hidden rounded bg-gradient-to-r from-blue-600 to-blue-800 text-white text-sm sm:text-base shadow hover:opacity-90 transition-all duration-200 flex items-center justify-center"
              >
                <span className="font-semibold flex items-center">
                  <i className="fa-solid fa-triangle-exclamation mr-2"></i>
                  Verify Email
                </span>
              </button>
            </div>
          )}
        </section>

        {/* Quick Stats / Additional Info Card */}
        <section
          className={`col-span-1 xl:col-span-1 p-6 rounded-lg shadow-md transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <h2 className="text-xl font-bold mb-4">Account Stats</h2>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Case Briefs:</strong> {vals.cases}
            </p>
            <p>
              <strong>Public Profile:</strong>{' '}
              {vals.link !== 'Not available' ? (
                <a
                  href={`https://${vals.link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-500 hover:text-blue-400"
                >
                  {vals.link}
                </a>
              ) : (
                vals.link
              )}
            </p>
          </div>
        </section>
      </div>

      {/* Update Log Button */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => setShowUpdateLog(true)}
          className="group relative h-12 w-full sm:w-56 overflow-hidden rounded bg-gradient-to-r from-blue-600 to-blue-800 text-white text-sm sm:text-base shadow hover:opacity-90 transition-all duration-200 flex items-center justify-center"
        >
          <span className="font-semibold">Update Log</span>
        </button>
      </div>

      <div className="mt-auto">
        <LogoFiller />
      </div>

      {/* Update Log Modal */}
      {showUpdateLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className={`max-w-2xl w-full p-6 rounded-lg shadow-lg ${
              isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-blue-950'
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold">Update Log</h3>
              <button onClick={() => setShowUpdateLog(false)} className="text-xl font-bold">
                &times;
              </button>
            </div>
            <div className="space-y-6 max-h-96 overflow-y-auto">
              {/* Version 0.9.0 */}
              <div>
                <h4 className="text-xl font-semibold">Version 0.9.0</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Advanced AI-driven legal analysis engine implemented for deeper case insights.</li>
                  <li>Integrated multiple legal databases to enhance resource indexing.</li>
                  <li>Introduced interactive case timeline visualizations.</li>
                  <li>Revamped UI with modern design elements and responsive layouts.</li>
                  <li>Enhanced security protocols with advanced encryption techniques.</li>
                </ul>
              </div>
              {/* Version 0.8.0 */}
              <div>
                <h4 className="text-xl font-semibold">Version 0.8.0</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Refined natural language query processing for improved legal research accuracy.</li>
                  <li>Integrated real-time updates for legal statutes and case law changes.</li>
                  <li>Optimized dark mode with enhanced high-contrast themes for accessibility.</li>
                  <li>Streamlined subscription management workflows for a smoother user experience.</li>
                </ul>
              </div>
              {/* Version 0.7.0 */}
              <div>
                <h4 className="text-xl font-semibold">Version 0.7.0</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Launched the Cadexlaw AI Chatbot to deliver instant legal query responses.</li>
                  <li>Expanded the legal resource library with updated case summaries and briefs.</li>
                  <li>Enhanced search functionality with predictive text and contextual suggestions.</li>
                  <li>Resolved various UI bugs to improve overall navigation and user experience.</li>
                </ul>
              </div>
              {/* Version 0.6.0 */}
              <div>
                <h4 className="text-xl font-semibold">Version 0.6.0</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Introduced interactive study notes and collaborative features for users.</li>
                  <li>Optimized data fetching performance to accelerate legal content loading times.</li>
                  <li>Laid the groundwork for future AI-driven legal research enhancements.</li>
                  <li>Incorporated early user feedback to enhance UI responsiveness and stability.</li>
                </ul>
              </div>
              {/* Initial Release */}
              <div>
                <h4 className="text-xl font-semibold">Initial Release</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Launched Cadexlaw.com as an AI Law Tool for advanced legal research.</li>
                  <li>Introduced a comprehensive library of legal study materials and case law databases.</li>
                  <li>Implemented basic AI-assisted research tools and study recommendations.</li>
                  <li>Established the core framework for continuous enhancements in legal research.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
