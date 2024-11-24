'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { useAuth } from '@/context/AuthContext'
import { db } from '@/firebase'
import Button from '@/components/Button'
import Image from 'next/image'
import { Poppins } from 'next/font/google'

const poppins = Poppins({
    subsets: ["latin"],
    weight: ['400', '100', '200', '300', '500', '600', '700']
});

export default function SuccessfulCheckoutPage() {
    const { setUserDataObj, currentUser } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!currentUser?.uid) {
            // Redirect unauthenticated users to login
            router.push('/login') // Adjust the path as needed
            return
        }

        const fetchUserData = async () => {
            try {
                const docRef = doc(db, "users", currentUser.uid)
                const docSnap = await getDoc(docRef)
                console.log('Fetching user data')

                if (docSnap.exists()) {
                    console.log('Found user data')
                    const firebaseData = docSnap.data()
                    setUserDataObj(firebaseData)
                    // Optionally, cache data in local storage
                    localStorage.setItem('hyr', JSON.stringify(firebaseData))
                } else {
                    console.log('No user data found')
                    setError('No user data found.')
                }
            } catch (err) {
                console.log('Failed to fetch data', err.message)
                setError('Failed to fetch user data.')
            } finally {
                setLoading(false)
            }
        }

        fetchUserData()
    }, [currentUser?.uid, setUserDataObj, router])

    if (loading) {
        return (
            <div className='flex flex-1 items-center justify-center flex-col gap-8 pb-20'>
                <p className='text-center text-slate-600'>Loading your account details...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className='flex flex-1 items-center justify-center flex-col gap-8 pb-20'>
                <h2 className={'text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-center ' + poppins.className}>
                    <span className='text-red-500'>Error</span>
                </h2>
                <p className='text-center text-slate-600'>{error}</p>
                <div className='flex flex-col items-center justify-center mt-4'>
                    <Button text="Back to dashboard" clickHandler={() => { router.push('/admin') }} />
                </div>
            </div>
        )
    }

    return (
        <div className='flex flex-1 items-center justify-center flex-col gap-8 pb-20'>
            <h2 className={'text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-center ' + poppins.className}>
                <span className='text-blue-950'>Congratulations</span>
            </h2>
            <p className='text-center text-slate-600'>Your account was successfully upgraded to <b>Pro</b>!</p>
            <div className='flex flex-col items-center justify-center mt-4'>
                <Button text="Back to dashboard" clickHandler={() => { router.push('/admin/account') }} />
            </div>
        </div>
    )
}
