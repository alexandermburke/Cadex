'use client';
import React from 'react';
import Image from 'next/image'; // Import Image from next/image
import { Poppins } from 'next/font/google';
import { useAuth } from '@/context/AuthContext'; // Import useAuth

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '100', '200', '300', '500', '600', '700'],
});

export default function Legal() {
  const { currentUser, userDataObj } = useAuth();
  const isDarkMode = userDataObj?.darkMode || false;

  return (
    <div className={`flex flex-col gap-6 p-6 ${poppins.className}`}>
      {/* Add the header image */}
      <Image
        src="/header.avif"
        alt="Header"
        width={100}
        height={100}
        className="mx-auto"
        unoptimized={true}
      />

      {/* Update the title */}
      <h1 className={`text-3xl sm:text-3xl md:text-3xl lg:text-3xl font-semibold text-center ${isDarkMode ? 'text-white' : 'text-blue-950'} goldGradient`}>
        Terms & Conditions
      </h1>

      <p className={`text-base sm:text-lg md:text-xl ${isDarkMode ? 'text-white' : 'text-black'}`}>
        Welcome to Cadex. These Terms & Conditions govern your use of Cadex&#39;s website and services.
        By accessing or using Cadex, you agree to be bound by these Terms & Conditions. If you do
        not agree with these Terms & Conditions, please do not use Cadex.
      </p>

      <h2 className={`text-2xl font-semibold mt-4 ${isDarkMode ? 'text-white' : 'text-blue-950'}`}>
        Use of Cadex
      </h2>
      <p className={`text-base ${isDarkMode ? 'text-white' : 'text-black'}`}>
        You must be at least 18 years old to use Cadex. By using Cadex, you represent and warrant
        that you are at least 18 years old.
      </p>
      <p className={`text-base ${isDarkMode ? 'text-white' : 'text-black'}`}>
        You agree to use Cadex&#39;s website and services only for lawful purposes and in accordance
        with these Terms & Conditions.
      </p>

      <h2 className={`text-2xl font-semibold mt-4 ${isDarkMode ? 'text-white' : 'text-blue-950'}`}>
        Disclaimer: Not a Substitute for Legal Advice
      </h2>
      <p className={`text-base ${isDarkMode ? 'text-white' : 'text-black'}`}>
        Cadex is intended solely as a supplementary tool to assist lawyers, law students, and legal
        enthusiasts in their educational and professional pursuits. It is not a substitute for
        professional legal advice from a qualified attorney, nor should it be considered an
        alternative to formal legal examinations such as the LSAT or Bar Exam. Users should exercise
        caution, as the information provided by Cadex may not be comprehensive or up-to-date.
        Therefore, any information or insights provided by Cadex should not be relied upon without
        conducting your own independent research and verification.
      </p>

      <h2 className={`text-2xl font-semibold mt-4 ${isDarkMode ? 'text-white' : 'text-blue-950'}`}>
        Intellectual Property
      </h2>
      <p className={`text-base ${isDarkMode ? 'text-white' : 'text-black'}`}>
        All content on Cadex&#39;s website, including but not limited to text, graphics, logos, images,
        and software, is the property of Cadex or its licensors and is protected by copyright,
        trademark, and other intellectual property laws.
      </p>
      <p className={`text-base ${isDarkMode ? 'text-white' : 'text-black'}`}>
        You may not modify, reproduce, distribute, transmit, display, or create derivative works of
        any content on Cadex without our prior written consent.
      </p>

      <h2 className={`text-2xl font-semibold mt-4 ${isDarkMode ? 'text-white' : 'text-blue-950'}`}>
        Disclaimer of Warranties
      </h2>
      <p className={`text-base ${isDarkMode ? 'text-white' : 'text-black'}`}>
        Cadex&#39;s website and services are provided on an &#39;as is&#39; and &#39;as available&#39; basis, without
        any warranties of any kind, either express or implied. Cadex does not warrant that its
        website will be uninterrupted or error-free, or that any defects will be corrected.
      </p>

      <h2 className={`text-2xl font-semibold mt-4 ${isDarkMode ? 'text-white' : 'text-blue-950'}`}>
        Limitation of Liability
      </h2>
      <p className={`text-base ${isDarkMode ? 'text-white' : 'text-black'}`}>
        In no event shall Cadex be liable for any direct, indirect, incidental, special, or
        consequential damages arising out of or in any way connected with your use of Cadex&#39;s
        website or services, whether based on contract, tort, strict liability, or any other legal
        theory.
      </p>

      <h2 className={`text-2xl font-semibold mt-4 ${isDarkMode ? 'text-white' : 'text-blue-950'}`}>
        Indemnification
      </h2>
      <p className={`text-base ${isDarkMode ? 'text-white' : 'text-black'}`}>
        You agree to indemnify and hold harmless Cadex, its affiliates, officers, directors,
        employees, and agents from and against any and all claims, liabilities, damages, losses,
        costs, or expenses, including reasonable attorneys&#39; fees, arising out of or in any way
        connected with your use of Cadex&#39;s website or services.
      </p>

      <h2 className={`text-2xl font-semibold mt-4 ${isDarkMode ? 'text-white' : 'text-blue-950'}`}>
        Governing Law
      </h2>
      <p className={`text-base ${isDarkMode ? 'text-white' : 'text-black'}`}>
        These Terms & Conditions shall be governed by and construed in accordance with the laws of
        the State of Arizona, without regard to its conflicts of law provisions.
      </p>

      <h2 className={`text-2xl font-semibold mt-4 ${isDarkMode ? 'text-white' : 'text-blue-950'}`}>
        Jurisdiction
      </h2>
      <p className={`text-base ${isDarkMode ? 'text-white' : 'text-black'}`}>
        Any legal suit, action, or proceeding arising out of, or related to, these Terms &
        Conditions or the use of Cadex&#39;s website or services shall be instituted exclusively in the
        federal or state courts located in Maricopa County, Arizona.
      </p>

      <h2 className={`text-2xl font-semibold mt-4 ${isDarkMode ? 'text-white' : 'text-blue-950'}`}>
        Changes to Terms & Conditions
      </h2>
      <p className={`text-base ${isDarkMode ? 'text-white' : 'text-black'}`}>
        Cadex reserves the right to update or change these Terms & Conditions at any time. Any
        changes will be effective immediately upon posting the revised Terms & Conditions on its
        website.
      </p>

      <h2 className={`text-2xl font-semibold mt-4 ${isDarkMode ? 'text-white' : 'text-blue-950'}`}>
        Contact Us
      </h2>
      <p className={`text-base ${isDarkMode ? 'text-white' : 'text-black'}`}>
        If you have any questions or concerns about these Terms & Conditions, please contact us at{' '}
        <a href="mailto:support@cadexlaw.com" className={`underline ${isDarkMode ? 'text-white' : 'text-blue-600'}`}>
          support@cadexlaw.com
        </a>
        .
      </p>

      <p className={`mt-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>
        By using Cadex, you acknowledge that you have read and understand these Terms & Conditions
        and agree to be bound by them.
      </p>
    </div>
  );
}
