// Sidebar.js
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FaLock } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function Sidebar({ activeLink, isSidebarVisible, toggleSidebar }) {
  const router = useRouter();
  const { currentUser, userDataObj } = useAuth();

  // Ensure plan names are in lowercase for consistent comparison
  const plan = userDataObj?.billing?.plan?.toLowerCase() || 'free'; // Default to 'free' if plan is undefined

  // Define access variables
  const hasAccess = plan === 'pro' || plan === 'developer';
  const hasSimulationAccess = plan === 'pro' || plan === 'basic';

  // Helper function to render locked links
  const renderLockedLink = (label, IconComponent) => (
    <div className="flex items-center gap-4 p-2 text-gray-400 cursor-not-allowed group">
      <IconComponent className="text-gray-400" size={20} />
      <span className="relative">{label}</span>
    </div>
  );

  // Sidebar animation variants
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

  // Helper function to render navigation links
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

  // Helper function to render locked navigation links
  const renderLockedNavLink = (label) => (
    <li>{renderLockedLink(label, FaLock)}</li>
  );

  return (
    <motion.aside
      className="z-[150] fixed top-0 left-0 w-64 h-full bg-gradient-to-b from-blue-950 to-slate-800 text-white flex flex-col md:relative md:translate-x-0 overflow-hidden"
      initial="hidden"
      animate={isSidebarVisible ? 'visible' : 'hidden'}
      variants={sidebarVariants}
      exit="hidden"
    >
      {/* Logo or Brand Name */}
      <div className="p-6 flex items-center justify-center">
       <h1 className="text-3xl font-bold goldGradient shine-text relative overflow-hidden">
         Dashboard
          </h1>
        </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-6">
        {/* Study & Research Section */}
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

        {/* AI Study Aids Section */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-4">AI Study Aids</h2>
          <ul className="space-y-2">
            {hasAccess ? (
              <>
                {renderNavLink('/ailawtools/analysis', 'fa-solid fa-brain', 'AI Flashcards')}
                {renderNavLink('/ailawtools/contractreview', 'fa-solid fa-lightbulb', 'Hypothetical Analyzer')}
                {renderNavLink('/ailawtools/predictive', 'fa-solid fa-chart-line', 'Exam Insights')}
              </>
            ) : (
              <>
                {renderLockedNavLink('AI Flashcards')}
                {renderLockedNavLink('Hypothetical Analyzer')}
                {renderLockedNavLink('Exam Insights')}
              </>
            )}
          </ul>
        </section>

        {/* Exam Preparation Section */}
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
            {/* Feature Request Button (Always visible, not locked) */}
            <li>
              <Link
                href="https://discord.gg/k26TN5N2"
                className="flex items-center gap-3 p-3 rounded transition-colors duration-200 hover:bg-blue-800 hover:bg-opacity-75"
              >
                <i className="fa-solid fa-lightbulb"></i>
                <span>Request a Feature</span>
              </Link>
            </li>
          </ul>
        </section>
      </nav>

      {/* User Info Section */}
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
