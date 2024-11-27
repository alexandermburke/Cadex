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
        <h1 className="text-3xl font-bold goldGradient">Dashboard</h1>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-6">
        {/* Law Tools Section */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Law Tools</h2>
          <ul className="space-y-2">
            {hasAccess ? (
              <>
                {renderNavLink('/lawtools/research', 'fa-solid fa-gavel', 'Legal Research')}
                {renderNavLink('/lawtools/casemanagement', 'fa-solid fa-folder-open', 'Case Management')}
                {renderNavLink('/lawtools/documentdrafting', 'fa-solid fa-file-alt', 'Document Drafting')}
              </>
            ) : (
              <>
                {renderLockedNavLink('Legal Research')}
                {renderLockedNavLink('Case Management')}
                {renderLockedNavLink('Document Drafting')}
              </>
            )}
          </ul>
        </section>

        {/* AI Law Tools Section */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-4">AI Law Tools</h2>
          <ul className="space-y-2">
            {hasAccess ? (
              <>
                {renderNavLink('/ailawtools/analysis', 'fa-solid fa-brain', 'Legal Analysis')}
                {renderNavLink('/ailawtools/contractreview', 'fa-solid fa-robot', 'Contract Review')}
                {renderNavLink('/ailawtools/predictive', 'fa-solid fa-chart-line', 'Predictive Analytics')}
              </>
            ) : (
              <>
                {renderLockedNavLink('Legal Analysis')}
                {renderLockedNavLink('Contract Review')}
                {renderLockedNavLink('Predictive Analytics')}
              </>
            )}
          </ul>
        </section>

        {/* AI Law Simulation Section */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-4">AI Law Simulation</h2>
          <ul className="space-y-2">
            {hasSimulationAccess ? (
              <>
                {renderNavLink('/admin/case', 'fa-solid fa-globe', 'Simulate Case')}
                {renderNavLink('/ailawtools/examprep', 'fa-solid fa-flask', 'LSAT/BAR Prep')}
              </>
            ) : (
              <>
                {renderLockedNavLink('Simulate Case')}
                {renderLockedNavLink('LSAT/BAR Prep')}
              </>
            )}
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
