'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  FaLock, 
  FaBook, 
  FaBookOpen, 
  FaBalanceScale, 
  FaGraduationCap, 
  FaCogs, 
  FaStickyNote, 
  FaFileInvoice, 
  FaQuestionCircle, 
  FaExclamationTriangle, 
  FaGavel, 
  FaTools, 
  FaCheckCircle, 
  FaClipboardList, 
  FaClipboardCheck, 
  FaIdCard, 
  FaClock, 
  FaRobot, 
  FaChartBar, 
  FaFileAlt, 
  FaFolderOpen, 
  FaParagraph, 
  FaEye, 
  FaUserSecret, 
  FaCrosshairs, 
  FaSearch, 
  FaBrain, 
  FaListAlt, 
  FaComment, 
  FaChevronDown, 
  FaChevronUp 
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import clsx from 'clsx';

/**
 * Reusable NavLink component for active and hover states.
 */
const NavLink = ({ href, icon, label, active }) => (
  <li>
    <Link
      href={href}
      className={clsx(
        'flex items-center gap-3 p-3 rounded transition-colors duration-200',
        {
          'bg-blue-800': active,
          'hover:bg-blue-800 hover:bg-opacity-75': !active,
        }
      )}
      aria-current={active ? 'page' : undefined}
    >
      {icon}
      <span>{label}</span>
    </Link>
  </li>
);

/**
 * Reusable LockedNavLink component for locked access.
 */
const LockedNavLink = ({ icon, label }) => (
  <li>
    <div className="flex items-center justify-between gap-2 p-3 text-gray-400 cursor-not-allowed">
      <div className="flex items-center gap-3">
        {icon}
        <span className="relative">{label}</span>
      </div>
      <FaLock className="text-gray-400" size={14} />
    </div>
  </li>
);

/**
 * Reusable ToggleSection component for collapsible sidebar sections.
 */
const ToggleSection = ({
  isOpen,
  toggle,
  title,
  icon,
  children,
}) => (
  <section>
    <button
      onClick={toggle}
      className="w-full flex items-center justify-between p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-blue-800 hover:bg-opacity-75 transition-colors duration-200"
      aria-expanded={isOpen}
      aria-controls={`${title}-section`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-medium">{title}</span>
      </div>
      {isOpen ? <FaChevronUp /> : <FaChevronDown />}
    </button>
    {isOpen && (
      <ul
        id={`${title}-section`}
        className="mt-2 ml-6 space-y-1"
      >
        {children}
      </ul>
    )}
  </section>
);

export default function Sidebar({ activeLink, isSidebarVisible, toggleSidebar, isAiTutor }) {
  const router = useRouter();
  const { currentUser, userDataObj } = useAuth();

  const plan = userDataObj?.billing?.plan?.toLowerCase() || 'free'; 
  const isDarkMode = userDataObj?.darkMode || false;

  const hasAccess = plan === 'free'; 
  const hasSimulationAccess = plan === 'free' || plan === 'basic'; // change to pro

  const [isStudyResearchOpen, setIsStudyResearchOpen] = useState(false);
  const [isCogsOpen, setIsCogsOpen] = useState(false);
  const [isIracOpen, setIsIracOpen] = useState(false);
  const [isExamPrepOpen, setIsExamPrepOpen] = useState(false);
  const [isContractsOpen, setIsContractsOpen] = useState(false);
  const [isTortsOpen, setIsTortsOpen] = useState(false);
  const [isCaseBriefsOpen, setIsCaseBriefsOpen] = useState(false);

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

  const sidebarBackground = clsx({
    'bg-gradient-to-b from-blue-900 to-slate-900': isDarkMode,
    'bg-gradient-to-b from-blue-950 to-slate-950': !isDarkMode,
  });

  return (
    <motion.aside
      className={`z-[9999] fixed top-0 left-0 w-96 h-full ${sidebarBackground} text-white flex flex-col md:relative md:translate-x-0 overflow-y-auto transition-colors duration-500 shadow-md rounded-lg`}
      initial="hidden"
      animate={isSidebarVisible ? 'visible' : 'hidden'}
      variants={sidebarVariants}
      exit="hidden"
      aria-label="Sidebar Navigation"
    >
      {/* Sidebar Header */}
      <div className="p-6 flex items-center justify-center bg-opacity-20">
        <h1 className="text-3xl font-semibold relative overflow-hidden">
          Dashboard
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 py-4 space-y-6">
        {/* Study & Research */}
        <ToggleSection
          isOpen={isStudyResearchOpen}
          toggle={() => setIsStudyResearchOpen(!isStudyResearchOpen)}
          title="Study & Research"
          icon={<FaBook className="text-lg" />}
        >
          {hasAccess ? (
            <>
              <NavLink 
                href="/lawtools/dictionary" 
                icon={<FaBookOpen className="text-sm" />} 
                label="Legal Dictionary" 
                active={activeLink === '/lawtools/dictionary'} 
              />
              <NavLink 
                href="/lawtools/casesummaries" 
                icon={<FaBalanceScale className="text-sm" />} 
                label="Case Summaries" 
                active={activeLink === '/lawtools/casesummaries'} 
              />
              <NavLink 
                href="/lawtools/lecturesummaries" 
                icon={<FaGraduationCap className="text-sm" />} 
                label="Lecture Summaries" 
                active={activeLink === '/lawtools/lecturesummaries'} 
              />
            </>
          ) : (
            <>
              <LockedNavLink icon={<FaBookOpen className="text-sm" />} label="Legal Dictionary" />
              <LockedNavLink icon={<FaBalanceScale className="text-sm" />} label="Case Summaries" />
              <LockedNavLink icon={<FaGraduationCap className="text-sm" />} label="Lecture Summaries" />
            </>
          )}
        </ToggleSection>

        {/* Enhanced Study Tools */}
        <ToggleSection
          isOpen={isCogsOpen}
          toggle={() => setIsCogsOpen(!isCogsOpen)}
          title="Enhanced Study Tools"
          icon={<FaCogs className="text-lg" />}
        >
          {hasAccess ? (
            <>
              <NavLink 
                href="/ailawtools/flashcards" 
                icon={<FaStickyNote className="text-sm" />} 
                label="Generative Flashcards" 
                active={activeLink === '/ailawtools/flashcards'} 
              />
              <NavLink 
                href="/ailawtools/irac" 
                icon={<FaFileInvoice className="text-sm" />} 
                label="Generative IRAC" 
                active={activeLink === '/ailawtools/irac'} 
              />
            </>
          ) : (
            <>
              <LockedNavLink icon={<FaStickyNote className="text-sm" />} label="Generative Flashcards" />
              <LockedNavLink icon={<FaFileInvoice className="text-sm" />} label="Generative IRAC" />
            </>
          )}
        </ToggleSection>

        {/* IRAC Method */}
        <ToggleSection
          isOpen={isIracOpen}
          toggle={() => setIsIracOpen(!isIracOpen)}
          title="IRAC Method"
          icon={<FaQuestionCircle className="text-lg" />}
        >
          {hasAccess ? (
            <>
              <NavLink 
                href="/irac/issue" 
                icon={<FaExclamationTriangle className="text-sm" />} 
                label="Issue" 
                active={activeLink === '/irac/issue'} 
              />
              <NavLink 
                href="/irac/rule" 
                icon={<FaGavel className="text-sm" />} 
                label="Rule" 
                active={activeLink === '/irac/rule'} 
              />
              <NavLink 
                href="/irac/application" 
                icon={<FaTools className="text-sm" />} 
                label="Application" 
                active={activeLink === '/irac/application'} 
              />
              <NavLink 
                href="/irac/conclusion" 
                icon={<FaCheckCircle className="text-sm" />} 
                label="Conclusion" 
                active={activeLink === '/irac/conclusion'} 
              />
            </>
          ) : (
            <>
              <LockedNavLink icon={<FaExclamationTriangle className="text-sm" />} label="Issue" />
              <LockedNavLink icon={<FaGavel className="text-sm" />} label="Rule" />
              <LockedNavLink icon={<FaTools className="text-sm" />} label="Application" />
              <LockedNavLink icon={<FaCheckCircle className="text-sm" />} label="Conclusion" />
            </>
          )}
        </ToggleSection>

        {/* Exam Preparation */}
        <ToggleSection
          isOpen={isExamPrepOpen}
          toggle={() => setIsExamPrepOpen(!isExamPrepOpen)}
          title="Exam Preparation"
          icon={<FaClipboardList className="text-lg" />}
        >
          {hasSimulationAccess ? (
            <>
              <NavLink 
                href="/ailawtools/examprep/practice-exams" 
                icon={<FaClipboardCheck className="text-sm" />} 
                label="Practice Exams" 
                active={activeLink === '/ailawtools/examprep/practice-exams'} 
              />
              <NavLink 
                href="/ailawtools/examprep/flashcards" 
                icon={<FaIdCard className="text-sm" />} 
                label="Flashcards" 
                active={activeLink === '/ailawtools/examprep/flashcards'} 
              />
              <NavLink 
                href="/ailawtools/examprep/timemanagement" 
                icon={<FaClock className="text-sm" />} 
                label="Time Management" 
                active={activeLink === '/ailawtools/examprep/timemanagement'} 
              />
              <NavLink 
                href="/ailawtools/lexapi" 
                icon={<FaRobot className="text-sm" />} 
                label="LExAPI Tutor" 
                active={activeLink === '/ailawtools/lexapi'} 
              />
              <NavLink 
                href="/ailawtools/examprep/insights" 
                icon={<FaChartBar className="text-sm" />} 
                label="Exam Insights" 
                active={activeLink === '/ailawtools/examprep/insights'} 
              />
            </>
          ) : (
            <>
              <LockedNavLink icon={<FaClipboardCheck className="text-sm" />} label="Practice Exams" />
              <LockedNavLink icon={<FaIdCard className="text-sm" />} label="Flashcards" />
              <LockedNavLink icon={<FaClock className="text-sm" />} label="Time Management" />
              <LockedNavLink icon={<FaRobot className="text-sm" />} label="LExAPI Tutor" />
              <LockedNavLink icon={<FaChartBar className="text-sm" />} label="Exam Insights" />
            </>
          )}
        </ToggleSection>

        {/* Contracts */}
        <ToggleSection
          isOpen={isContractsOpen}
          toggle={() => setIsContractsOpen(!isContractsOpen)}
          title="Contracts"
          icon={<FaFileInvoice className="text-lg" />}
        >
          {hasAccess ? (
            <>
              <NavLink 
                href="/contracts/basics" 
                icon={<FaFileAlt className="text-sm" />} 
                label="Basics" 
                active={activeLink === '/contracts/basics'} 
              />
              <NavLink 
                href="/contracts/advanced" 
                icon={<FaFolderOpen className="text-sm" />} 
                label="Advanced Topics" 
                active={activeLink === '/contracts/advanced'} 
              />
              <NavLink 
                href="/contracts/clauses" 
                icon={<FaParagraph className="text-sm" />} 
                label="Common Clauses" 
                active={activeLink === '/contracts/clauses'} 
              />
            </>
          ) : (
            <>
              <LockedNavLink icon={<FaFileAlt className="text-sm" />} label="Basics" />
              <LockedNavLink icon={<FaFolderOpen className="text-sm" />} label="Advanced Topics" />
              <LockedNavLink icon={<FaParagraph className="text-sm" />} label="Common Clauses" />
            </>
          )}
        </ToggleSection>

        {/* Torts */}
        <ToggleSection
          isOpen={isTortsOpen}
          toggle={() => setIsTortsOpen(!isTortsOpen)}
          title="Torts"
          icon={<FaExclamationTriangle className="text-lg" />}
        >
          {hasAccess ? (
            <>
              <NavLink 
                href="/torts/overview" 
                icon={<FaEye className="text-sm" />} 
                label="Overview" 
                active={activeLink === '/torts/overview'} 
              />
              <NavLink 
                href="/torts/negligence" 
                icon={<FaUserSecret className="text-sm" />} 
                label="Negligence" 
                active={activeLink === '/torts/negligence'} 
              />
              <NavLink 
                href="/torts/intentional" 
                icon={<FaCrosshairs className="text-sm" />} 
                label="Intentional Torts" 
                active={activeLink === '/torts/intentional'} 
              />
            </>
          ) : (
            <>
              <LockedNavLink icon={<FaEye className="text-sm" />} label="Overview" />
              <LockedNavLink icon={<FaUserSecret className="text-sm" />} label="Negligence" />
              <LockedNavLink icon={<FaCrosshairs className="text-sm" />} label="Intentional Torts" />
            </>
          )}
        </ToggleSection>

        {/* Case Briefs */}
        <ToggleSection
          isOpen={isCaseBriefsOpen}
          toggle={() => setIsCaseBriefsOpen(!isCaseBriefsOpen)}
          title="Case Briefs"
          icon={<FaSearch className="text-lg" />}
        >
          {hasAccess ? (
            <>
              <NavLink 
                href="/casebriefs/analysis" 
                icon={<FaBrain className="text-sm" />} 
                label="Case Analysis" 
                active={activeLink === '/casebriefs/analysis'} 
              />
              <NavLink 
                href="/casebriefs/summaries" 
                icon={<FaListAlt className="text-sm" />} 
                label="Case Summaries" 
                active={activeLink === '/casebriefs/summaries'} 
              />
              <NavLink 
                href="/casebriefs/briefing" 
                icon={<FaBookOpen className="text-sm" />} 
                label="See all Case Briefs" 
                active={activeLink === '/casebriefs/briefing'} 
              />
            </>
          ) : (
            <>
              <LockedNavLink icon={<FaBrain className="text-sm" />} label="Case Analysis" />
              <LockedNavLink icon={<FaListAlt className="text-sm" />} label="Case Summaries" />
              <LockedNavLink icon={<FaBookOpen className="text-sm" />} label="See all Case Briefs" />
            </>
          )}
        </ToggleSection>

        {/* Requests/Suggestions */}
        <section>
          <Link
            href="https://discord.gg/wKgH9ussWc"
            className="flex items-center gap-3 p-3 rounded transition-colors duration-200 hover:bg-blue-800 hover:bg-opacity-75 mt-6"
          >
            <FaComment className="text-lg" />
            <span>Requests/Suggestions</span>
          </Link>
        </section>
      </nav>

      {/* Sidebar Footer */}
      <footer className="px-6 py-4 bg-transparent">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">
              {currentUser?.displayName || 'User'}
            </p>
            <p className="text-sm text-blue-200 truncate">
              {currentUser?.email || 'user@example.com'}
            </p>
          </div>
          <span
            className={clsx(
              'px-3 py-1 rounded text-xs font-semibold uppercase whitespace-nowrap',
              {
                'bg-gradient-to-r from-blue-400 to-blue-600 text-white': hasAccess,
                'bg-gradient-to-r from-emerald-400 to-emerald-600 text-white': !hasAccess,
              }
            )}
          >
            {plan.charAt(0).toUpperCase() + plan.slice(1)}
          </span>
        </div>
      </footer>
    </motion.aside>
  );
}
