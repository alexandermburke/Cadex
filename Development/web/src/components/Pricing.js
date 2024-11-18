'use client';
import { Poppins } from 'next/font/google';
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const poppins = Poppins({ subsets: ["latin"], weight: ['400', '100', '200', '300', '500', '600', '700'] });

const plans = [
    {
        name: 'Basic',
        description: 'For Individual Legal Study & Practice',
        price: '$1 USD',
        interval: 'Per day',
        features: [
            'Unlimited access to all case simulations',
            'Unlimited access to LSAT/Bar exam prep',
            'Cancel any time',
            'No Ads',
            'Join public case discussions',
        ],
        recommended: false
    },
    {
        name: 'Pro',
        description: 'For Law Firms & Professional Use',
        price: '$50 USD',
        interval: 'Per month',
        features: [
            'Everything in the Base plan',
            'Access to all AI tools',
            'Access to all legal tools',
            'Priority support and feature requests',
        ],
        recommended: true
    },
]

export default function Plans() {

    const { currentUser, userDataObj, isPaid } = useAuth()
    const router = useRouter()

    return (
        <>
            {/* Header Section */}
            <div className='flex flex-col gap-6'>
                <h2 className={'text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-center ' + poppins.className}>
                    Find the <span className='goldGradient'>plan</span> for you
                </h2>
            </div>

            {/* Plans Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 sm:mx-auto gap-8'>
                {plans.map((plan, planIndex) => (
                    <div
                        key={planIndex}
                        className={`p-4 sm:p-8 border border-solid rounded-2xl duration-200 hover:scale-[102%] sm:hover:scale-[105%] bg-white goldShadow w-full sm:w-96 max-w-full flex flex-col gap-4 ${
                            plan.recommended ? 'border-blue-400' : 'border-blue-200'
                        }`}
                    >
                        {/* Plan Header */}
                        <div className='flex items-center justify-between gap-4 w-full'>
                            <h3
                                className={`font-medium text-lg sm:text-xl md:text-2xl ${
                                    plan.recommended ? 'goldGradient' : ''
                                } ${poppins.className}`}
                            >
                                {plan.name}
                            </h3>
                            {plan.recommended && (
                                <p className='bg-emerald-400 text-white px-2 py-1 rounded text-xs sm:text-sm'>Recommended</p>
                            )}
                        </div>

                        {/* Plan Price and Interval */}
                        <div className='flex flex-col text-left'>
                            <p className={`font-semibold text-2xl sm:text-3xl md:text-4xl whitespace-nowrap ${poppins.className}`}>
                                {plan.price}
                            </p>
                            <p className='text-xs sm:text-sm pt-2'>{plan.interval}</p>
                        </div>

                        <hr />

                        {/* Plan Description */}
                        <p className='font-medium text-base sm:text-lg md:text-xl'>{plan.description}</p>

                        {/* Plan Features */}
                        <ul className='flex flex-col gap-2'>
                            {plan.features.map((feature, featureIndex) => (
                                <li key={featureIndex} className='flex items-center gap-4 text-left'>
                                    <i className="fa-solid fa-check text-emerald-400"></i>
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Footer Section */}
            <div className='flex flex-col gap-6 mt-8'>
            </div>
        </>
    )
}
