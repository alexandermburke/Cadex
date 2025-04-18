'use client';

import { Poppins } from 'next/font/google';
import React, { useState } from 'react';
import Button from './Button';
import { useAuth } from '@/context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useRouter } from 'next/navigation';
import { FaInfoCircle } from 'react-icons/fa';
import { BsStars } from 'react-icons/bs';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

/**
 * Updated pricing model:
 *  - Basic: $10
 *  - Pro: $20
 *  - Expert: $30
 * (All well below Quimbee's $19-$29 range)
 */
const plans = [
  {
    name: 'Basic',
    description: 'Perfect for 1L or Students that only need Case Briefs.',
    price: 8,
    interval: 'Per month',
    promotion: 'First 7 days free',
    features: [
      {
        text: 'Instant Access to 20,000+ Briefs',
        info: 'Practice issue-spotting and drafting in real-life legal scenarios.',
      },
      {
        text: 'Advanced Case Summaries',
        info: 'Unlimited access to our database of Case briefs with detailed summaries.',
      },
      {
        text: 'Access to LExAPI Chatbot',
        info: 'Ask any Legal question, at any time.',
      },
      {
        text: 'Ad-free user experience',
      },
      {
        text: 'Cancel at any time, no questions asked.',
      },
    ],
    recommended: false,
  },
  {
    name: 'Pro',
    description: 'Robust preparation for law students needing advanced tools.',
    price: 20,
    interval: 'Per month',
    features: [
      { text: 'All Basic Plan Features' },
      {
        text: 'All Exam Prep Tools',
        info: 'Timed practice exams plus deeper analytics on strengths and weaknesses.',
      },
      {
        text: 'IRAC Drafting & Issue Spotter',
        info: 'Quickly generate IRAC outlines for assignments, exams, or practice scenarios.',
      },
      {
        text: 'Smart Flashcards',
        info: 'Adaptive flashcards to focus on areas needing improvement.',
      },
      {
        text: 'Ability to Create & Refresh Briefs',
        info: 'Faster response times for technical and content-related questions.',
      },
      {
        text: 'Upgraded LExAPI 3.0 Access',
        info: 'Accurate AI based research, writing, and exam prep.',
      },
      {
        text: 'Early Access to Beta Features',
        info: 'Accurate AI based research, writing, and exam prep.',
      },
    ],
    recommended: true,
  },
  {
    name: 'Expert',
    description: 'Best for 2L & 3L students or those seeking top performance.',
    price: 30,
    interval: 'Per month',
    features: [
      { text: 'All Pro Plan Features' },
      {
        text: 'Upgraded LExAPI 4.0 Access',
        info: 'Even more accurate AI based research, writing, and exam prep.',
      },
      {
        text: 'Advanced Subject Outlines',
        info: 'Deep-dive data on study patterns, time allocation, and performance.',
      },
      {
        text: 'Access to AI Application Review',
        info: 'Network with top-performing peers and share study outlines.',
      },
      {
        text: 'Access to Career & Internship Resources',
        info: 'Schedule 1:1 AI assisted sessions to refine study strategy and address weak areas.',
      },
    ],
    recommended: false,
    comingSoon: false,
  },
];


export default function Plans() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const { currentUser, userDataObj } = useAuth();
  const router = useRouter();

  const currentPlan = userDataObj?.billing?.plan;
  const isDarkMode = userDataObj?.darkMode || false;

  const [billingCycle, setBillingCycle] = useState('monthly'); 
  const [holidaySale, setHolidaySale] = useState(false); 
  const [showExpertModal, setShowExpertModal] = useState(false);

  // New billing toggle options (using the same style as the sidebar toggle)
  const billingOptions = [
    { label: 'Pay monthly', value: 'monthly' },
    { label: 'Pay yearly', value: 'yearly' },
  ];
  const selectedBillingIndex = billingCycle === 'monthly' ? 0 : 1;
  const handleToggleBillingCycle = (value) => {
    setBillingCycle(value);
  };

  let filteredPlans = plans;
  if (currentPlan === 'Basic') {
    filteredPlans = plans.filter((plan) => plan.name !== 'Basic');
  } else if (currentPlan === 'Pro') {
    filteredPlans = plans.filter((plan) => plan.name === 'Expert');
  } else if (currentPlan === 'Expert') {
    filteredPlans = [];
  }

  function formatPrice(price) {
    let finalPrice = price;
    let originalPrice = price;

    if (billingCycle === 'yearly') {
      finalPrice = price * 12 * 0.9;
      originalPrice = price * 12;
    }

    if (holidaySale) {
      const discountedPrice = finalPrice / 1.25;
      return (
        <>
          <span className="line-through text-red-500">
            ${originalPrice.toFixed(2)}
          </span>{' '}
          /{' '}
          <span className="font-bold text-green-500">
            ${discountedPrice.toFixed(2)}
          </span>
        </>
      );
    }

    return `$${finalPrice.toFixed(2)}`;
  }

  async function handleUpdatePlan() {
    if (!selectedPlan) return;
    if (selectedPlan === 'Expert') {
      setShowExpertModal(true);
      return;
    }

    // Removed immediate Firestore update.
    // Pass the selected plan and other details to Stripe via your backend
    const options = {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        customerId: userDataObj?.billing?.stripeCustomerId,
        userId: currentUser.uid,
        email: currentUser.email,
        plan: selectedPlan, // Pass the plan here for metadata
        billingCycle, 
      }),
    };

    const response = await fetch('/api/checkout', options);
    const data = await response.json();
    router.push(data.url);
  }

  return (
    <div
      className={`flex flex-col w-full gap-8 ${
        isDarkMode ? 'bg-slate-900 text-white' : 'bg-transparent text-gray-800'
      } min-h-screen p-4 sm:p-8 transition-colors duration-300`}
    >
      {/* Holiday Sale Banner (Optional) */}
      {holidaySale && (
        <section
          className={`w-full max-h-10 p-4 sm:p-6 rounded-lg flex items-center justify-center transition-colors duration-300 mx-auto goldBackgroundAlt text-white`}
        >
          <div className="flex items-center gap-2">
            <BsStars className="text-2xl" />
            <span className="font-semibold">
              Holiday Sale: 25% Off Forever
            </span>
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="w-full flex flex-col items-center text-center">
        <h2
          className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-blue-950'
          } ${poppins.className}`}
        >
          Find the{' '}
          <span className="bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
            plan
          </span>{' '}
          for you
        </h2>
        <p
          className={`text-lg sm:text-xl md:text-2xl max-w-2xl ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          Choose a plan that best fits your study needs. Upgrade anytime to
          unlock more advanced features!
        </p>
      </section>

      <section className="flex items-center justify-center my-10">
        <div
          className={clsx(
            'relative flex items-center rounded-full p-2 transition-colors duration-200',
            isDarkMode ? 'bg-gray-200' : 'bg-gray-200'
          )}
          style={{ width: '250px' }}
        >
          <motion.div
            className={clsx(
              'absolute top-0 left-0 h-full rounded-full shadow',
              isDarkMode ? 'bg-white' : 'bg-white'
            )}
            style={{ width: '50%' }}
            initial={false}
            animate={{ x: `${selectedBillingIndex * 100}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
          {billingOptions.map((option, i) => (
            <button
              key={option.value}
              onClick={() => handleToggleBillingCycle(option.value)}
              className={clsx(
                'relative z-10 flex-1 text-sm sm:text-md font-semibold py-1 transition-colors',
                selectedBillingIndex === i
                  ? isDarkMode
                    ? 'text-blue-600'
                    : 'text-blue-600'
                  : isDarkMode
                  ? 'text-gray-700'
                  : 'text-gray-700'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center w-full max-w-6xl mx-auto">
        {filteredPlans.map((plan, planIndex) => (
          <div
            key={planIndex}
            onClick={() => setSelectedPlan(plan.name)}
            className={`relative p-6 sm:p-8 border border-solid rounded-2xl shadow-lg transition-transform duration-300 hover:scale-105 cursor-pointer max-w-sm ${
              selectedPlan === plan.name
                ? 'border-blue-500 bg-gradient-to-r from-blue-100 to-blue-50'
                : isDarkMode
                ? 'border-gray-700 bg-slate-800'
                : 'border-white bg-white'
            }`}
          >
            {/* Promotion Badge for Basic Plan (optional) */}
            {plan.promotion && (
              <div className="absolute top-0 left-0 transform -translate-y-1/2 px-4 py-1 goldBackgroundAlt text-gray-800 text-sm font-semibold rounded-full shadow-md">
                {plan.promotion}
              </div>
            )}

            {/* Plan Header */}
            <div className="flex items-center justify-between mb-4">
              <h3
                className={`text-2xl sm:text-3xl font-bold ${
                  plan.recommended
                    ? 'text-gradient bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent'
                    : isDarkMode
                    ? 'text-white'
                    : 'text-blue-950'
                } ${poppins.className}`}
              >
                {plan.name}
              </h3>
              {plan.recommended && (
                <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full">
                  Recommended
                </span>
              )}
            </div>

            {/* Plan Price and Interval */}
            <div className="flex flex-col items-start mb-4">
              <p className={`text-3xl sm:text-4xl font-semibold ${poppins.className}`}>
                {formatPrice(plan.price)}
              </p>
              <p className="text-sm text-gray-600">
                {billingCycle === 'monthly' ? 'Per month' : 'Per year'}
              </p>
            </div>

            <hr className="border-gray-300 mb-4" />

            {/* Plan Description */}
            <p
              className={`text-md sm:text-lg font-medium mb-4 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              {plan.description}
            </p>

            {/* Plan Features */}
            <ul className="flex flex-col gap-2 mb-4 relative">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-start gap-2 group">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-500 flex-shrink-0 mt-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className={clsx('flex-1', isDarkMode ? 'text-gray-300' : 'text-gray-700')}>
                    {feature.text}
                  </span>
                  {feature.info && (
                    <div className="relative flex-shrink-0">
                      <FaInfoCircle className="text-gray-400 hover:text-gray-600 cursor-pointer" />
                      {/* Tooltip */}
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-700 text-white text-xs rounded py-1 px-2 w-48 z-50">
                        {feature.info}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Get Plan Button */}
      {selectedPlan && (
           <div className="flex justify-center w-full">
         <Button
              clickHandler={handleUpdatePlan}
              text="Start 7 Day Free Trial"
            />
        </div>
      )}

      {/* Message when no plans are available */}
      {filteredPlans.length === 0 && (
        <div className="flex flex-col items-center mt-8">
          <p
            className={`text-xl font-semibold ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            You are already on the highest plan.
          </p>
        </div>
      )}

      {/* FAQ Section */}
      <section
        className={`w-full p-6 rounded-lg transition-colors duration-300 flex flex-col items-center gap-4 ${
          isDarkMode ? 'bg-slate-800' : 'bg-white'
        }`}
      >
        <h2
          className={`text-3xl font-bold ${poppins.className} ${
            isDarkMode ? 'text-white' : 'text-blue-950'
          }`}
        >
          Frequently Asked Questions
        </h2>
        <div className="max-w-4xl w-full space-y-4">
          <div className="flex flex-col gap-2">
            <h3
              className={`text-xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-blue-900'
              }`}
            >
              Which plan should I choose?
            </h3>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              Basic is great if you want essential tools and case briefs at a low cost. Pro is ideal for students who need advanced features like IRAC generation and deeper analytics. Expert is for those aiming for top class performance, offering the highest level of AI assistance and exclusive study communities.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h3
              className={`text-xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-blue-900'
              }`}
            >
              How do I upgrade my plan?
            </h3>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              Select the desired plan from the options above. Once you click “Get Plan,” you’ll be taken through a secure checkout flow handled by Stripe. After completion, your account will instantly upgrade.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h3
              className={`text-xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-blue-900'
              }`}
            >
              Can I switch between monthly and yearly billing?
            </h3>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              Yes! Use the toggle above to switch between billing cycles. Yearly billing includes a 10% discount. If you switch mid-subscription, your next billing date will reflect the new cycle and pricing.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h3
              className={`text-xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-blue-900'
              }`}
            >
              Is there a free trial available?
            </h3>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              Yes. All plans include a 7-day free trial for new users. You can cancel at any time before the trial ends without being charged.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h3
              className={`text-xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-blue-900'
              }`}
            >
              How do I cancel my subscription?
            </h3>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              Go to Billing &amp; Plan settings and select “Cancel Subscription.” You’ll be re-directed to Stripe where you can cancel your plan. Your plan will remain active until the end of your current billing period, and you won’t be charged moving forward.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h3
              className={`text-xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-blue-900'
              }`}
            >
              Is this cheaper than other services?
            </h3>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              Absolutely. Our plans range from $8 to $30 per month, which is significantly lower than competitor tiers. We aim to provide high-quality study tools at an even more affordable rate.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Section with Stripe Logo */}
      <div className="flex flex-col items-center gap-2 mt-8">
        <div className="flex items-center justify-center gap-2">
          <p
            className={`text-center ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            } ${poppins.className}`}
          >
            All transactions are handled by Stripe
          </p>
        </div>
      </div>

      {/* Expert Plan Unavailability Modal */}
      {showExpertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg max-w-md w-full text-center">
            <h3 className="text-2xl font-semibold mb-4">Plan Coming Soon</h3>
            <p className="mb-4">
              The Expert plan is currently under development and is not available for purchase. Please select a different plan.
            </p>
            <Button
              text="Close"
              clickHandler={() => setShowExpertModal(false)}
              additionalClasses="w-full sm:w-56 h-12 text-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
