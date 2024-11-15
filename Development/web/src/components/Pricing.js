'use client'
import { Poppins } from 'next/font/google';
import React, { useState } from 'react'
import Button from './Button';
import { useAuth } from '@/context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useRouter } from 'next/navigation';

const poppins = Poppins({ subsets: ["latin"], weight: ['400', '100', '200', '300', '500', '600', '700'] });

const plans = [
    {
        name: 'Basic',
        description: 'For Individual Legal Study & Practice',
        price: '$1 USD',
        interval: 'Per day',
        features: [
            'Access to all AI tools',
            'Access to all legal tools',
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
            'Unlimited access to all case simulations',
            'Unlimited access to LSAT/Bar exam prep',
            'Priority support and feature requests',
        ],
        recommended: true
    },
]


export default function Plans() {

    const [selectedPlan, setSelectedPlan] = useState(null)
    const { currentUser, setUserDataObj, userDataObj, isPaid } = useAuth()
    const router = useRouter()

    async function handleUpdatePlan() {
        if (!selectedPlan || isPaid) { return }
        let billing = { plan: 'free', status: false }
        router.push('/admin/billing')

        if (selectedPlan === 'Pro') {
            billing.plan = 'Pro'
        }

    
        // if the selected plan is pro, send to checkout
        if (selectedPlan === 'Pro') {
          
            router.push('/admin/billing')
        }

    }

    return (
        <>
            <div className='flex flex-col gap-6'>
                <h2 className={'text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-center  ' + poppins.className}>Find the <span className='goldGradient'>plan</span> for you</h2>
         
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 sm:mx-auto gap-8'>
                {plans.map((plan, planIndex) => {
                    return (
                        <button onClick={() => setSelectedPlan(plan.name)} key={planIndex} className={"p-4 outline-none focus:outline-none sm:p-8 border border-solid  rounded-2xl duration-200 hover:scale-[102%] sm:hover:scale-[105%] bg-white goldShadow w-full sm:w-96 max-w-full flex flex-col gap-4 " + (selectedPlan === plan.name ? ' border-blue-400' : ' border-blue-200')}>
                            <div className='flex items-center justify-between gap-4 w-full'>
                                <h3 className={'font-medium text-lg sm:text-xl md:text-2xl ' + (selectedPlan === plan.name ? ' goldGradient ' : ' ') + poppins.className}>{plan.name}</h3>
                                {plan.name === 'Pro' && (
                                    <p className='bg-emerald-400 text-white px-2 py-1 rounded text-xs sm:text-sm'>Recommended</p>
                                )}
                            </div>
                            <div className='flex flex-col text-left'>
                                <p className={'font-semibold text-2xl sm:text-3xl md:text-4xl whitespace-nowrap ' + poppins.className}>{plan.price}</p>
                                <p className='text-xs sm:text-sm pt-2'>{plan.interval}</p>
                                <p className='text-xs sm:text-sm pt-2'>{plan.disclaimer}</p>
                            </div>
                            <hr />
                            <p className='font-medium text-base sm:text-lg md:text-xl'>{plan.description}</p>
                            {plan.features.map((feature, featureIndex) => {
                                return (
                                    <div className='flex items-center gap-4 text-left' key={featureIndex}>
                                        <i className="fa-solid fa-check  text-emerald-400"></i>
                                        <p>{feature}</p>
                                    </div>
                                 
                                )
                            })}
                        </button>
                    )
                })}
                                          
            </div>
            {selectedPlan && (
                <div className='flex flex-col max-w-[600px] mx-auto w-full'>
                    <Button text={`Get ${selectedPlan}`} clickHandler={handleUpdatePlan} />
                </div>
            )}
          <div className='flex flex-col gap-6'>
                 <p className='text-center'>All transactions are handled by Stripe</p>
            </div>
        </>
        
    )
}
