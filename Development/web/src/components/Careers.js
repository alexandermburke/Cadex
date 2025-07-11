'use client'
import { Poppins } from 'next/font/google';
import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

const poppins = Poppins({ subsets: ["latin"], weight: ['400', '100', '200', '300', '500', '600', '700'] });

export default function Careers() {
    const { currentUser, userDataObj } = useAuth();
    const isDarkMode = userDataObj?.darkMode || false;

    const [email, setEmail] = useState('');
    const [resume, setResume] = useState(null);
    const [message, setMessage] = useState('');

    const handleFileChange = (e) => {
        setResume(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        if (!email || !resume) {
            setMessage('Please provide both your email and resume.');
            return;
        }
        const formData = new FormData();
        formData.append('applicantEmail', email);
        formData.append('recipientEmail', 'alex@cadexlaw.com');
        formData.append('resume', resume);

        try {
            const response = await fetch('/api/careers', {
                method: 'POST',
                body: formData,
            });
            if (response.ok) {
                setMessage('Your application has been submitted successfully!');
            } else {
                setMessage('There was an error submitting your application. Please try again later.');
            }
        } catch (error) {
            console.error(error);
            setMessage('There was an error submitting your application. Please try again later.');
        }
    };

    return (
        <section className='flex flex-col items-center justify-center gap-10 md:gap-16 w-full mx-auto py-10'>
            <div className='flex flex-col items-center gap-8 text-center w-full lg:max-w-2xl'>
                <div className='flex flex-col items-center'>
                    <Image
                        src="/header.avif"
                        alt="CadexLaw Logo"
                        width={288}
                        height={288}
                        className='w-24 h-24 sm:mr-4 mb-4'
                        unoptimized={true}
                        quality={'100'}
                    />
                    <h2 className={`text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-700'} ${poppins.className}`}>
                        <span className={`goldGradient ${isDarkMode ? 'text-white' : 'text-blue-950'}`}>Join Our Team</span> and Shape the Future of Legal Practice
                    </h2>
                </div>
                <p className={`text-base sm:text-lg md:text-xl ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    At CadexLaw, we are always looking for talented individuals to join our team. Submit your resume and email for review to start your journey with us.
                </p>
                <div className={`w-full lg:max-w-md ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    <p className='font-semibold mb-2'>We’re hiring for:</p>
                    <ul className='text-base sm:text-lg md:text-xl'>
                        <li>Experienced Legal Experts</li>
                        <li>Experienced Software Developers</li>
                        <li>Social Media Content Creators & Partners</li>
                    </ul>
                </div>
                <form onSubmit={handleSubmit} className='flex flex-col gap-4 w-full lg:max-w-md'>
                    <input
                        type='email'
                        placeholder='Your Email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={`w-full p-3 border rounded ${isDarkMode ? 'border-gray-700 text-white bg-gray-800' : 'border-gray-300 text-black bg-white'}`}
                    />
                    <input
                        type='file'
                        onChange={handleFileChange}
                        required
                        className={`w-full p-3 border rounded ${isDarkMode ? 'border-gray-700 text-white bg-gray-800' : 'border-gray-300 text-black bg-white'}`}
                    />
                    <div className='flex justify-center'>
                        <button
                            type='submit'
                            className={`relative h-12 w-56 overflow-hidden rounded goldBackground text-white shadow-2xl transition-all before:absolute before:top-0 before:right-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-56`}
                        >
                            Submit Application
                        </button>
                    </div>
                    {message && <p className={`${isDarkMode ? 'text-green-400' : 'text-green-500'}`}>{message}</p>}
                </form>
            </div>
        </section>
    );
}
