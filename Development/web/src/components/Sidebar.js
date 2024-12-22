// Sidebar.js
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FaLock } from 'react-icons/fa';
import { motion } from 'framer-motion';
import clsx from 'clsx'; // Ensure clsx is installed: npm install clsx

export default function Sidebar({ activeLink, isSidebarVisible, toggleSidebar, isAiTutor }) {
  const router = useRouter();
  const { currentUser, userDataObj } = useAuth();

  const plan = userDataObj?.billing?.plan?.toLowerCase() || 'free'; 
  const isDarkMode = userDataObj?.darkMode || false;

  const hasAccess = plan === 'free' || plan === 'developer'; 
  const hasSimulationAccess = plan === 'free' || plan === 'basic';

  const renderLockedLink = (label, IconComponent) => (
    <div className="flex items-center gap-4 p-2 text-gray-400 cursor-not-allowed group">
      <IconComponent className="text-gray-400" size={20} />
      <span className="relative">{label}</span>
    </div>
  );

  const sidebarVariants = {
    hidden: {
      x: '-100%',
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
    visible: {
      x: '0%',
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
  };

  const renderNavLink = (href, iconClass, label) => (
    <li>
      <Link
        href={href}
        className={`flex items-center gap-3 p-3 rounded transition-colors duration-200 ${
          activeLink === href
            ? 'bg-blue-800'
            : 'hover:bg-blue-800 hover:bg-opacity-75'
        }`}
      >
        <i className={iconClass}></i>
        <span>{label}</span>
      </Link>
    </li>
  );

  const colorfulrenderNavLink = (href, iconClass, label) => (
    <li>
      <Link
        href={href}
        className={`flex items-center gap-3 p-3 rounded transition-colors duration-200 ${
          activeLink === href
            ? 'bg-blue-800'
            : 'bg-transparent hover:bg-blue-800 hover:bg-opacity-75'
        }`}
      >
        <i className={`${iconClass} bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent`}></i>
        <span className="text-white">{label}</span>
      </Link>
    </li>
  );

  const flashcardrenderNavLink = (href, iconClass, label) => (
    <li>
      <Link
        href={href}
        className={`flex items-center gap-3 p-3 rounded transition-colors duration-200 ${
          activeLink === href
            ? 'bg-blue-800'
            : 'bg-transparent hover:bg-blue-800 hover:bg-opacity-75'
        }`}
      >
        <i className={`${iconClass} bg-yellow-100 bg-clip-text text-transparent`}></i>
        <span className="text-white">{label}</span>
      </Link>
    </li>
  );


  const renderLockedNavLink = (label) => (
    <li>{renderLockedLink(label, FaLock)}</li>
  );

  // Determine background gradient based on dark mode
  const sidebarBackground = clsx({
    'bg-gradient-to-b from-blue-900 to-slate-900': isDarkMode,
    'bg-gradient-to-b from-blue-950 to-slate-950': !isDarkMode,
  });

  return (
    <motion.aside
    className={`z-[9999] fixed top-0 left-0 w-64 h-full ${sidebarBackground} text-white flex flex-col md:relative md:translate-x-0 overflow-hidden transition-colors duration-500 shadow-md rounded`}
    initial="hidden"
      animate={isSidebarVisible ? 'visible' : 'hidden'}
      variants={sidebarVariants}
      exit="hidden"
    >
      <div className="p-6 flex items-center justify-center">
        <h1 className="text-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white font-semibold relative overflow-hidden">
          Dashboard
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto px-6">
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Study & Research</h2>
          <ul className="space-y-2">
            {hasAccess ? (
              <>
                {renderNavLink('/lawtools/research', 'fa-solid fa-file-lines', 'Case Summaries')}
                {renderNavLink('/lawtools/casemanagement', 'fa-solid fa-list', 'Outline Builder')}
                {renderNavLink('/lawtools/documentdrafting', 'fa-solid fa-scroll', 'Statute Explorer')}
              </>
            ) : (
              <>
                {renderLockedNavLink('Case Summaries')}
                {renderLockedNavLink('Outline Builder')}
                {renderLockedNavLink('Statute Explorer')}
              </>
            )}
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-4">AI Study Aids</h2>
          <ul className="space-y-2">
            {hasAccess ? (
              <>
                {flashcardrenderNavLink('/ailawtools/analysis', 'fa-solid fa-lightbulb', 'Generative Flashcards')}
                {colorfulrenderNavLink('/ailawtools/contractreview', 'fa-solid fa-brain', 'LExAPI Tutor')}
                {renderNavLink('/ailawtools/predictive', 'fa-solid fa-chart-line', 'Exam Insights')}
              </>
            ) : (
              <>
                {renderLockedNavLink('Generative Flashcards')}
                {renderLockedNavLink('LExAPI Tutor')}
                {renderLockedNavLink('Exam Insights')}
              </>
            )}
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Exam Preparation</h2>
          <ul className="space-y-2">
            {hasSimulationAccess ? (
              <>
                {renderNavLink('/ailawtools/examprep', 'fa-solid fa-flask', 'LSAT/BAR Prep')}
              </>
            ) : (
              <>
                {renderLockedNavLink('LSAT/BAR Prep')}
              </>
            )}
            <li>
              <Link
                href="https://discord.gg/wKgH9ussWc"
                className="flex items-center gap-3 p-3 rounded transition-colors duration-200 hover:bg-blue-800 hover:bg-opacity-75"
              >
                <i className="fa-solid fa-comment"></i>
                <span>Requests/Suggestions</span>
              </Link>
            </li>
          </ul>
        </section>
      </nav>

      <footer className="px-6 py-4 bg-transparent">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{currentUser?.displayName || 'User'}</p>
            <p className="text-sm text-blue-200 truncate">
              {currentUser?.email || 'user@example.com'}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded text-xs font-semibold uppercase whitespace-nowrap ${
              hasAccess
                ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white'
                : 'bg-gradient-to-r from-emerald-400 to-emerald-600 text-white'
            }`}
          >
            {plan.charAt(0).toUpperCase() + plan.slice(1)}
          </span>
        </div>
      </footer>
    </motion.aside>
  );
}
