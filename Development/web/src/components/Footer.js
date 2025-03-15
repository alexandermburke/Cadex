
'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaTwitter, FaInstagram, FaDiscord, FaYoutube } from 'react-icons/fa';
import { Poppins } from 'next/font/google';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase'; 

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '100', '200', '300', '500', '600', '700'],
});

export default function Footer() {
  const [firestoreData, setFirestoreData] = useState({
    versionNumber: '',
    copyright: '',
  });
  useEffect(() => {
    async function fetchData() {
      try {
        const docRef = doc(db, 'ApplicationDetails', 'CadexLaw');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFirestoreData({
            versionNumber: data.versionNumber || '',
            copyright: data.Copyright || '',
          });
        } else {
          console.warn('No such document in Firestore!');
        }
      } catch (err) {
        console.error('Error fetching app details:', err);
      }
    }
    fetchData();
  }, []);

  return (
    <footer className="flex flex-col bg-gradient-to-r from-blue-950 to-slate-950 text-white py-4">
      <div className="flex flex-col sm:flex-row items-center justify-center flex-wrap gap-6 sm:gap-8 md:gap-10 mx-auto py-4 px-8 text-sm">
        <div className="flex flex-col w-fit shrink-0 gap-2 whitespace-nowrap text-center">
          <div className="flex flex-col mx-auto w-fit">
            <Link href={'/'}>
              <h1 className={'text-lg px-3 sm:text-xl sm:px-4 ' + poppins.className}>
                CadexLaw
              </h1>
            </Link>
          </div>

          {/* Dynamically fetched from Firestore */}
          <p className="mx-auto text-xs">
            © {firestoreData.copyright || 'Loading...'}
          </p>
          <p className="mx-auto text-xs font-semibold">
            Version {firestoreData.versionNumber || '0.9.0'} Build
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 md:gap-10">
          {/* Navigation Section */}
          <div className="flex flex-col gap-2 w-fit">
            <h3 className="font-bold">Navigation</h3>
            <div className="flex flex-col gap-1 text-sm">
              <Link
                className="relative w-fit overflow-hidden hover:underline"
                href={'https://www.cadexlaw.com/ailawtools/splash'}
              >
                <p>Practice</p>
              </Link>
              <Link
                className="relative w-fit overflow-hidden hover:underline"
                href={'https://www.cadexlaw.com/ailawtools/splash'}
              >
                <p>Login</p>
              </Link>
              <Link
                className="relative w-fit overflow-hidden hover:underline"
                href={'https://www.cadexlaw.com/ailawtools/splash'}
              >
                <p>Join</p>
              </Link>
            </div>
          </div>

          {/* Contact Section */}
          <div className="flex flex-col gap-2 w-fit">
            <h3 className="font-bold">Contact</h3>
            <div className="flex flex-col gap-1 text-sm">
              <Link
                href={'https://github.com/alexandermburke/enthlist/'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 relative w-fit overflow-hidden hover:underline"
              >
                <i className="fa-solid fa-envelope"></i>
                <p>Contact form</p>
              </Link>
              <div className="flex items-center gap-2 relative w-fit overflow-hidden">
                <i className="fa-solid fa-at"></i>
                <p>support@cadexlaw.com</p>
              </div>
              <div className="flex items-center gap-2 relative w-fit overflow-hidden">
                <i className="fa-solid fa-house"></i>
                <p>Scottsdale, Arizona</p>
              </div>
            </div>
          </div>

          {/* Legal Section */}
          <div className="flex flex-col gap-2 w-fit">
            <h3 className="font-bold">Legal</h3>
            <div className="flex flex-col gap-1 text-sm">
              <Link
                className="relative w-fit overflow-hidden hover:underline"
                href={'/privacypolicy'}
              >
                <p>Privacy Policy</p>
              </Link>
              <Link
                className="relative w-fit overflow-hidden hover:underline"
                href={'/termsandconditions'}
              >
                <p>Terms & Agreements</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="flex flex-col gap-2 w-fit">
          <h3 className="font-bold">Join Our Community</h3>
          <div className="flex gap-1">
            <Link
              href="https://twitter.com/yourprofile"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400"
            >
              <FaTwitter size={24} />
            </Link>
            <Link
              href="https://instagram.com/yourprofile"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pink-500"
            >
              <FaInstagram size={24} />
            </Link>
            <Link
              href="https://discord.gg/yourinvite"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-500"
            >
              <FaDiscord size={24} />
            </Link>
            <Link
              href="https://youtube.com/yourchannel"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-red-500"
            >
              <FaYoutube size={24} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
