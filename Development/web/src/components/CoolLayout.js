// components/CoolLayout.js

'use client';

import React, { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '@/context/AuthContext';
import { Analytics } from "@vercel/analytics/react"

export default function CoolLayout({ children }) {
    const { userDataObj } = useAuth();

    // Determine if dark mode is enabled
    const isDarkMode = userDataObj?.darkMode || false;

    useEffect(() => {
        // Toggle the 'dark' class on the root element based on dark mode state
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    return (
        <div className={`flex flex-col flex-1 w-full transition-colors duration-300 ${
            isDarkMode ? 'bg-gradient-to-b from-blue-950 to-slate-950' : 'bg-gradient-to-b from-slate-50 to-blue-50'
        }`}>
            <Header />
            {children}
            <Analytics />
            <Footer />
        </div>
    );
}
