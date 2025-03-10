'use client';
import React from 'react';
import Image from 'next/image'; // Import Image from next/image
import { Poppins } from 'next/font/google';
import { useAuth } from '@/context/AuthContext';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '100', '200', '300', '500', '600', '700'],
});

export default function PrivacyPolicy() {
  // We still get currentUser and userDataObj if needed later,
  // but we no longer use dark mode for styling.
  const { currentUser, userDataObj } = useAuth();

  return (
    <div className={`flex flex-col gap-6 p-6 ${poppins.className} text-white`}>
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
      <h1 className="text-3xl sm:text-3xl md:text-3xl lg:text-3xl font-semibold text-center goldGradient text-white">
        Privacy Policy
      </h1>

      <p className="text-base sm:text-lg md:text-xl text-white">
        Welcome to Cadex. Your privacy is of utmost importance to us. This Privacy Policy outlines how we collect, use, and protect your information when you use our website and services. By accessing or using Cadex, you agree to the practices described in this Privacy Policy. If you do not agree with these practices, please do not use Cadex.
      </p>

      <h2 className="text-2xl font-semibold mt-4 text-white">
        Information We Collect
      </h2>
      <p className="text-base text-white">
        Cadex collects minimal information necessary to provide you with our services. Currently, we only store your login credentials, which include your email address and password. We do not collect or store any additional personal information unless you choose to provide it voluntarily.
      </p>

      <h2 className="text-2xl font-semibold mt-4 text-white">
        Use of Information
      </h2>
      <p className="text-base text-white">
        The information we collect is used solely to authenticate your account and provide you with access to Cadex&apos;s features and services. We are committed to ensuring that your data is handled securely and responsibly.
      </p>

      <h2 className="text-2xl font-semibold mt-4 text-white">
        Information Sharing and Disclosure
      </h2>
      <p className="text-base text-white">
        Cadex does not sell, trade, or otherwise transfer your personally identifiable information to outside parties. This does not include trusted third parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.
      </p>

      <h2 className="text-2xl font-semibold mt-4 text-white">
        Data Security
      </h2>
      <p className="text-base text-white">
        We implement a variety of security measures to maintain the safety of your personal information. Your login credentials are stored securely, and we employ industry-standard practices to protect against unauthorized access, alteration, disclosure, or destruction of your data.
      </p>

      <h2 className="text-2xl font-semibold mt-4 text-white">
        Changes to This Privacy Policy
      </h2>
      <p className="text-base text-white">
        Cadex reserves the right to update or modify this Privacy Policy at any time. Any changes will be effective immediately upon posting the revised Privacy Policy on our website. We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information.
      </p>

      <h2 className="text-2xl font-semibold mt-4 text-white">
        Contact Us
      </h2>
      <p className="text-base text-white">
        If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at{' '}
        <a href="mailto:support@cadexlaw.com" className="underline text-white">
          support@cadexlaw.com
        </a>
        .
      </p>

      <p className="mt-4 text-white">
        By using Cadex, you acknowledge that you have read and understand this Privacy Policy and agree to the practices described herein.
      </p>
    </div>
  );
}
