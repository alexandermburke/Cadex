import { Poppins } from 'next/font/google';
import React, { useEffect, useState } from 'react';
import Button from './Button';
import { useSearchParams } from 'next/navigation';
import AuthError from './AuthError';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const poppins = Poppins({ subsets: ["latin"], weight: ['400', '100', '200', '300', '500', '600', '700'] });

export default function Register(props) {
    const { username, setUsername, email, setEmail, password, setPassword, step, goBack, handleSubmit, userExists, submitting, error, isVerifying } = props;

    const searchParams = useSearchParams();
    useEffect(() => {
        const URLusername = searchParams.get('username');
        if (!URLusername) { return; }
        setUsername(URLusername);
    }, [searchParams, setUsername]);

    const [showPassword, setShowPassword] = useState(false);
    
    // State to store email errors
    const [emailError, setEmailError] = useState("");

    // List of allowed email domains
    const allowedEmailDomains = [
        "gmail.com",
        "outlook.com",
        "asu.edu",
        "nau.edu",
        "uofa.edu",
        "yahoo.com",
        "hotmail.com",
        "live.com",
        "icloud.com",
        "aol.com",
        "msn.com",
        "cadexlaw.com",
        "harvard.edu",
        "stanford.edu",
        "yale.edu",
        "columbia.edu",
        "nyu.edu",
        "upenn.edu",
        "georgetown.edu",
        "northwestern.edu",
        "berkeley.edu",
        "cornell.edu",
        "duke.edu",
        "virginia.edu",
        "syr.edu",
        "unc.edu"
      ];
      
    // Custom email change handler that only allows emails from allowed domains
    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        const parts = value.split('@');
        if (parts.length === 2) {
            const domain = parts[1].toLowerCase();
            if (!allowedEmailDomains.includes(domain)) {
                setEmailError("Please use an email address from an approved provider. If you believe your domain should be included, contact support@cadexlaw.com for assistance.");

            } else {
                setEmailError("");
            }
        } else {
            setEmailError("");
        }
    };

    return (
        <>
            <div className='flex flex-col gap-6'>
                <h2 className={'text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-center ' + poppins.className}>
                    Join <span className='goldSolid'>CadexLaw.com</span>
                </h2>
                <p className='text-center'>
                    Sign up for free, affiliated users must have an email with a supported College or University.
                </p>
            </div>
            <div className='flex flex-col gap-4 text-base sm:text-lg'>
                {error && (<AuthError errMessage={error} />)}
                {step === 0 ? (
                    <>
                        <div className={'flex items-stretch border border-solid border-white rounded-full w-full max-w-[600px] mx-auto bg-white overflow-hidden'}>
                            <div className='flex items-stretch py-4 pl-4'>
                                <p>cadexlaw.com/</p>
                            </div>
                            <input 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                className='w-full flex-1 bg-white outline-none py-4' 
                                placeholder='username' 
                            />
                            <div className='px-2 rounded-full aspect-square pr-4 grid place-items-center'>
                                {userExists ? (
                                    <i className="fa-solid text-pink-400 fa-xmark"></i>
                                ) : (
                                    <i className="fa-solid text-emerald-400 fa-check"></i>
                                )}
                            </div>
                        </div>
                        <input 
                            value={email} 
                            type='email' 
                            onChange={handleEmailChange} 
                            className='flex-1 bg-white border border-solid border-white rounded-full max-w-[600px] mx-auto w-full outline-none p-4' 
                            placeholder='Email' 
                        />
                        {emailError && (
                            <p className="text-red-500 text-sm text-center">{emailError}</p>
                        )}
                    </>
                ) : (
                    <>
                        <p className='text-center'>Choose a strong password with at least 8 characters.</p>
                        <div className="relative max-w-[600px] mx-auto w-full">
                            <input 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                type={showPassword ? 'text' : 'password'} 
                                className='flex-1 bg-white border border-solid border-white rounded-full max-w-[600px] mx-auto w-full outline-none p-4 pr-12' 
                                placeholder='Password' 
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)} 
                                className="absolute inset-y-0 right-4 flex items-center transition-transform duration-200 hover:scale-110"
                            >
                                {showPassword ? (
                                    <FaEyeSlash className="h-5 w-5" />
                                ) : (
                                    <FaEye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </>
                )}
                <div className='flex items-stretch gap-4 max-w-[600px] mx-auto w-full'>
                    {step === 1 && (
                        <button 
                            onClick={goBack} 
                            className='w-fit p-4 rounded-full mx-auto bg-white px-8 duration-200 hover:opacity-60'
                        >
                            &larr; Back
                        </button>
                    )}
                    <Button 
                        text={step === 0 ? 'Create account' : 'Continue'} 
                        saving={submitting ? 'Submitting' : isVerifying ? 'Verifying username' : ''} 
                        clickHandler={handleSubmit} 
                    />
                </div>
            </div>
        </>
    );
}
