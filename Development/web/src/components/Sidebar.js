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

  const plan = userDataObj?.billing?.plan || 'free'; // Default to 'free' if plan is undefined

  // Helper function to render locked links
  const renderLockedLink = (label, IconComponent) => (
    <div className="flex items-center gap-4 p-2 text-gray-400 cursor-not-allowed group">
      <IconComponent className="text-gray-400" size={20} />
      <span className="relative">
        {label}
        <FaLock className="absolute -top-2 -right-6 text-gray-400 hidden group-hover:block" />
      </span>
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

  // Check if the user has access based on their plan
  const hasAccess = plan === 'Pro' || plan === 'Developer';

  return (
    <motion.aside
      className="fixed top-0 left-0 w-64 h-full bg-gradient-to-b from-blue-950 to-slate-800 text-white flex flex-col p-6 z-50 md:relative md:translate-x-0"
      initial="hidden"
      animate={isSidebarVisible ? 'visible' : 'hidden'}
      variants={sidebarVariants}
      exit="hidden"
    >
      {/* Logo or Brand Name */}
      <div className="mb-8 flex items-center justify-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1">
        {/* Law Tools Section */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Law Tools</h2>
          <ul className="space-y-2">
            {hasAccess ? (
              <>
                <li>
                  <Link
                    href="/lawtools/research"
                    className={`flex items-center gap-3 p-3 rounded transition-colors duration-200 ${
                      activeLink === '/lawtools/research'
                        ? 'bg-blue-800'
                        : 'hover:bg-blue-800 hover:bg-opacity-75'
                    }`}
                  >
                    <i className="fa-solid fa-gavel"></i>
                    <span>Legal Research</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/lawtools/casemanagement"
                    className={`flex items-center gap-3 p-3 rounded transition-colors duration-200 ${
                      activeLink === '/lawtools/casemanagement'
                        ? 'bg-blue-800'
                        : 'hover:bg-blue-800 hover:bg-opacity-75'
                    }`}
                  >
                    <i className="fa-solid fa-folder-open"></i>
                    <span>Case Management</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/lawtools/documentdrafting"
                    className={`flex items-center gap-3 p-3 rounded transition-colors duration-200 ${
                      activeLink === '/lawtools/documentdrafting'
                        ? 'bg-blue-800'
                        : 'hover:bg-blue-800 hover:bg-opacity-75'
                    }`}
                  >
                    <i className="fa-solid fa-file-alt"></i>
                    <span>Document Drafting</span>
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>{renderLockedLink('Legal Research', FaLock)}</li>
                <li>{renderLockedLink('Case Management', FaLock)}</li>
                <li>{renderLockedLink('Document Drafting', FaLock)}</li>
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
                <li>
                  <Link
                    href="/ailawtools/analysis"
                    className={`flex items-center gap-3 p-3 rounded transition-colors duration-200 ${
                      activeLink === '/ailawtools/analysis'
                        ? 'bg-blue-800'
                        : 'hover:bg-blue-800 hover:bg-opacity-75'
                    }`}
                  >
                    <i className="fa-solid fa-brain"></i>
                    <span>Legal Analysis</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/ailawtools/contractreview"
                    className={`flex items-center gap-3 p-3 rounded transition-colors duration-200 ${
                      activeLink === '/ailawtools/contractreview'
                        ? 'bg-blue-800'
                        : 'hover:bg-blue-800 hover:bg-opacity-75'
                    }`}
                  >
                    <i className="fa-solid fa-robot"></i>
                    <span>Contract Review</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/ailawtools/predictive"
                    className={`flex items-center gap-3 p-3 rounded transition-colors duration-200 ${
                      activeLink === '/ailawtools/predictive'
                        ? 'bg-blue-800'
                        : 'hover:bg-blue-800 hover:bg-opacity-75'
                    }`}
                  >
                    <i className="fa-solid fa-chart-line"></i>
                    <span>Predictive Analytics</span>
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>{renderLockedLink('Legal Analysis', FaLock)}</li>
                <li>{renderLockedLink('Contract Review', FaLock)}</li>
                <li>{renderLockedLink('Predictive Analytics', FaLock)}</li>
              </>
            )}
          </ul>
        </section>

        {/* AI Law Simulation Section */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-4">AI Law Simulation</h2>
          <ul className="space-y-2">
            {/* Simulate a Case - Available to all users */}
            <li>
              <Link
                href="/admin/case"
                className={`flex items-center gap-3 p-3 rounded transition-colors duration-200 ${
                  activeLink === '/admin/case'
                    ? 'bg-blue-800'
                    : 'hover:bg-blue-800 hover:bg-opacity-75'
                }`}
              >
                <i className="fa-solid fa-globe"></i>
                <span>Simulate a Case</span>
              </Link>
            </li>

            {/* LSAT/BAR Prep - Available to all users */}
            <li>
              <Link
                href="/ailawtools/examprep"
                className={`flex items-center gap-3 p-3 rounded transition-colors duration-200 ${
                  activeLink === '/ailawtools/examprep'
                    ? 'bg-blue-800'
                    : 'hover:bg-blue-800 hover:bg-opacity-75'
                }`}
              >
                <i className="fa-solid fa-flask"></i>
                <span>LSAT/BAR Prep</span>
              </Link>
            </li>
          </ul>
        </section>
      </nav>

      {/* User Info Section */}
      <footer className="mt-auto flex items-center gap-4 p-4 bg-transparent rounded">
        <div className="flex-1">
          <p className="font-semibold">{currentUser?.displayName || 'User'}</p>
          <p className="text-sm text-blue-200">{currentUser?.email || 'user@example.com'}</p>
        </div>
        <span
          className={`px-3 py-1 rounded text-xs font-semibold uppercase ${
            plan === 'Pro' || plan === 'Developer'
              ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white'
              : 'bg-gradient-to-r from-emerald-400 to-emerald-600 text-white'
          }`}
        >
          {plan}
        </span>
      </footer>
    </motion.aside>
  );
}
