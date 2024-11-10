'use client';
import { Poppins } from 'next/font/google';
import React from 'react';
import Image from 'next/image'; // Import Image from next/image

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '100', '200', '300', '500', '600', '700'],
});

export default function Legal() {
  return (
    <div className={'flex flex-col gap-6 p-6 ' + poppins.className}>
      {/* Add the header image */}
      <Image
        src="/header.png"
        alt="Header"
        width={100}
        height={100}
        className="mx-auto"
      />

      {/* Update the title */}
      <h1 className="text-3xl sm:text-3xl md:text-3xl lg:text-3xl font-semibold text-center goldGradient">
        Terms & Conditions
      </h1>

      <p>
        Welcome to Cadex. These Terms & Conditions govern your use of Cadex&#39;s website and services.
        By accessing or using Cadex, you agree to be bound by these Terms & Conditions. If you do
        not agree with these Terms & Conditions, please do not use Cadex.
      </p>

      <h2 className="text-2xl font-semibold mt-4">Use of Cadex</h2>
      <p>
        You must be at least 18 years old to use Cadex. By using Cadex, you represent and warrant
        that you are at least 18 years old.
      </p>
      <p>
        You agree to use Cadex&#39;s website and services only for lawful purposes and in accordance
        with these Terms & Conditions.
      </p>

      <h2 className="text-2xl font-semibold mt-4">
        Disclaimer: Not a Substitute for Legal Advice
      </h2>
      <p>
        Cadex is intended solely as a supplementary tool to assist lawyers, law students, and legal
        enthusiasts in their educational and professional pursuits. It is not a substitute for
        professional legal advice from a qualified attorney, nor should it be considered an
        alternative to formal legal examinations such as the LSAT or Bar Exam. Users should exercise
        caution, as the information provided by Cadex may not be comprehensive or up-to-date.
        Therefore, any information or insights provided by Cadex should not be relied upon without
        conducting your own independent research and verification.
      </p>

      <h2 className="text-2xl font-semibold mt-4">Intellectual Property</h2>
      <p>
        All content on Cadex&#39;s website, including but not limited to text, graphics, logos, images,
        and software, is the property of Cadex or its licensors and is protected by copyright,
        trademark, and other intellectual property laws.
      </p>
      <p>
        You may not modify, reproduce, distribute, transmit, display, or create derivative works of
        any content on Cadex without our prior written consent.
      </p>

      <h2 className="text-2xl font-semibold mt-4">Disclaimer of Warranties</h2>
      <p>
        Cadex&#39;s website and services are provided on an &#39;as is&#39; and &#39;as available&#39; basis, without
        any warranties of any kind, either express or implied. Cadex does not warrant that its
        website will be uninterrupted or error-free, or that any defects will be corrected.
      </p>

      <h2 className="text-2xl font-semibold mt-4">Limitation of Liability</h2>
      <p>
        In no event shall Cadex be liable for any direct, indirect, incidental, special, or
        consequential damages arising out of or in any way connected with your use of Cadex&#39;s
        website or services, whether based on contract, tort, strict liability, or any other legal
        theory.
      </p>

      <h2 className="text-2xl font-semibold mt-4">Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless Cadex, its affiliates, officers, directors,
        employees, and agents from and against any and all claims, liabilities, damages, losses,
        costs, or expenses, including reasonable attorneys&#39; fees, arising out of or in any way
        connected with your use of Cadex&#39;s website or services.
      </p>

      <h2 className="text-2xl font-semibold mt-4">Governing Law</h2>
      <p>
        These Terms & Conditions shall be governed by and construed in accordance with the laws of
        the State of Arizona, without regard to its conflicts of law provisions.
      </p>

      <h2 className="text-2xl font-semibold mt-4">Jurisdiction</h2>
      <p>
        Any legal suit, action, or proceeding arising out of, or related to, these Terms &
        Conditions or the use of Cadex&#39;s website or services shall be instituted exclusively in the
        federal or state courts located in Maricopa County, Arizona.
      </p>

      <h2 className="text-2xl font-semibold mt-4">Changes to Terms & Conditions</h2>
      <p>
        Cadex reserves the right to update or change these Terms & Conditions at any time. Any
        changes will be effective immediately upon posting the revised Terms & Conditions on its
        website.
      </p>

      <h2 className="text-2xl font-semibold mt-4">Contact Us</h2>
      <p>
        If you have any questions or concerns about these Terms & Conditions, please contact us at{' '}
        <a href="mailto:support@cadexlaw.com" className="text-blue-600 underline">
          support@cadexlaw.com
        </a>
        .
      </p>

      <p className="mt-4">
        By using Cadex, you acknowledge that you have read and understand these Terms & Conditions
        and agree to be bound by them.
      </p>
    </div>
  );
}
