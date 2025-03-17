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
  const lastUpdated = "3/10/2025, 6:12:43 PM";

  return (
    <div className={`flex flex-col gap-6 p-6 ${poppins.className}`}>
      {/* Header Image */}
      <Image
        src="/header.avif"
        alt="Header"
        width={100}
        height={100}
        className="mx-auto"
        unoptimized={true}
      />

      {/* Title */}
      <h1
        className={`text-3xl font-semibold text-center ${
          isDarkMode ? 'text-white' : 'text-blue-950'
        } goldGradient`}
      >
        Terms &amp; Conditions
      </h1>

      {/* Intro Paragraph */}
      <p
        className={`text-base sm:text-lg md:text-xl ${
          isDarkMode ? 'text-white' : 'text-black'
        }`}
      >
        Welcome to CadexLaw – your premier legal education platform designed specifically for analyzing case briefs and preparing for exams. These Terms &amp; Conditions govern your use of CadexLaw’s website and services. By accessing or using CadexLaw, you agree to be bound by these Terms &amp; Conditions. If you do not agree, please refrain from using our platform.
      </p>

      {/* Use of CadexLaw */}
      <h2
        className={`text-2xl font-semibold mt-4 ${
          isDarkMode ? 'text-white' : 'text-blue-950'
        }`}
      >
        Use of CadexLaw
      </h2>
      <p className={`text-base ${isDarkMode ? 'text-white' : 'text-black'}`}>
        CadexLaw is designed to assist law students and legal professionals in accessing detailed case briefs and exam preparation materials. You must be at least 18 years old to use CadexLaw. By using our platform, you represent and warrant that you meet this requirement and will use CadexLaw only for lawful purposes and in accordance with these Terms &amp; Conditions.
      </p>

      {/* Disclaimer */}
      <h2
        className={`text-2xl font-semibold mt-4 ${
          isDarkMode ? 'text-white' : 'text-blue-950'
        }`}
      >
        Disclaimer: Not a Substitute for Professional Advice
      </h2>
      <p
        className={`text-base ${isDarkMode ? 'text-white' : 'text-black'}`}
      >
        CadexLaw is a supplementary educational tool designed to enhance your understanding of case briefs and exam strategies. It is not a substitute for professional legal advice, formal legal education, or comprehensive exam preparation programs. Always consult a qualified professional for advice regarding your legal and academic pursuits.
      </p>

      {/* Intellectual Property */}
      <h2
        className={`text-2xl font-semibold mt-4 ${
          isDarkMode ? 'text-white' : 'text-blue-950'
        }`}
      >
        Intellectual Property
      </h2>
      <p
        className={`text-base ${isDarkMode ? 'text-white' : 'text-black'}`}
      >
        All content on CadexLaw’s website, including text, graphics, logos, images, and software, is the property of CadexLaw or its licensors and is protected by copyright, trademark, and other intellectual property laws.
      </p>
      <p
        className={`text-base ${isDarkMode ? 'text-white' : 'text-black'}`}
      >
        You may not modify, reproduce, distribute, transmit, display, or create derivative works of any content on CadexLaw without our prior written consent.
      </p>

      {/* Disclaimer of Warranties */}
      <h2
        className={`text-2xl font-semibold mt-4 ${
          isDarkMode ? 'text-white' : 'text-blue-950'
        }`}
      >
        Disclaimer of Warranties
      </h2>
      <p
        className={`text-base ${isDarkMode ? 'text-white' : 'text-black'}`}
      >
        CadexLaw’s website and services are provided &quot;as is&quot; and &quot;as available,&quot; without any warranties of any kind, either express or implied. We do not guarantee that our platform will be uninterrupted, error-free, or that the information provided is accurate, complete, or current.
      </p>

      {/* Limitation of Liability */}
      <h2
        className={`text-2xl font-semibold mt-4 ${
          isDarkMode ? 'text-white' : 'text-blue-950'
        }`}
      >
        Limitation of Liability
      </h2>
      <p
        className={`text-base ${isDarkMode ? 'text-white' : 'text-black'}`}
      >
        In no event shall CadexLaw be liable for any direct, indirect, incidental, special, or consequential damages arising out of or related to your use of our website or services, whether based on contract, tort, strict liability, or any other legal theory.
      </p>

      {/* Indemnification */}
      <h2
        className={`text-2xl font-semibold mt-4 ${
          isDarkMode ? 'text-white' : 'text-blue-950'
        }`}
      >
        Indemnification
      </h2>
      <p
        className={`text-base ${isDarkMode ? 'text-white' : 'text-black'}`}
      >
        You agree to indemnify and hold harmless CadexLaw, its affiliates, officers, directors, employees, and agents from any claims, liabilities, damages, losses, or expenses (including reasonable attorneys’ fees) arising out of or in any way connected with your use of our website or services.
      </p>

      {/* Governing Law */}
      <h2
        className={`text-2xl font-semibold mt-4 ${
          isDarkMode ? 'text-white' : 'text-blue-950'
        }`}
      >
        Governing Law
      </h2>
      <p
        className={`text-base ${isDarkMode ? 'text-white' : 'text-black'}`}
      >
        These Terms &amp; Conditions shall be governed by and construed in accordance with the laws of the State of Arizona, without regard to its conflicts of law provisions.
      </p>

      {/* Jurisdiction */}
      <h2
        className={`text-2xl font-semibold mt-4 ${
          isDarkMode ? 'text-white' : 'text-blue-950'
        }`}
      >
        Jurisdiction
      </h2>
      <p
        className={`text-base ${isDarkMode ? 'text-white' : 'text-black'}`}
      >
        Any legal suit, action, or proceeding arising out of or related to these Terms &amp; Conditions or your use of CadexLaw shall be brought exclusively in the federal or state courts located in Maricopa County, Arizona.
      </p>

      {/* Changes to Terms & Conditions */}
      <h2
        className={`text-2xl font-semibold mt-4 ${
          isDarkMode ? 'text-white' : 'text-blue-950'
        }`}
      >
        Changes to Terms &amp; Conditions
      </h2>
      <p
        className={`text-base ${isDarkMode ? 'text-white' : 'text-black'}`}
      >
        CadexLaw reserves the right to update or modify these Terms &amp; Conditions at any time. Any changes will be effective immediately upon posting the revised Terms &amp; Conditions on our website.
      </p>

      {/* Contact Us */}
      <h2
        className={`text-2xl font-semibold mt-4 ${
          isDarkMode ? 'text-white' : 'text-blue-950'
        }`}
      >
        Contact Us
      </h2>
      <p
        className={`text-base ${isDarkMode ? 'text-white' : 'text-black'}`}
      >
        If you have any questions or concerns about these Terms &amp; Conditions, please contact us at{' '}
        <a
          href="mailto:support@CadexLaw.com"
          className={`underline ${isDarkMode ? 'text-white' : 'text-blue-600'}`}
        >
          support@CadexLaw.com
        </a>
        .
      </p>

      {/* Agreement */}
      <p className={`mt-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>
        By using CadexLaw, you acknowledge that you have read and understand these Terms &amp; Conditions and agree to be bound by them.
      </p>

      {/* Last Updated */}
      <p className="text-center italic text-gray-500 mt-4">
        Last updated: {lastUpdated}
      </p>
    </div>
  );
}
