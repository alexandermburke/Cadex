'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar({ activeLink }) {
    const router = useRouter();
    const { currentUser, userDataObj, isPaid } = useAuth();

    const plan = userDataObj?.billing?.plan || 'free'; // Default to 'free' if plan is undefined

    // Helper function to render locked links
    const renderLockedLink = (label, iconClass) => (
        <div className="flex items-center gap-4 p-2 text-gray-400 cursor-not-allowed">
            <i className={`${iconClass} text-gray-400`}></i>
            <span>{label}</span>
            <i className="fa-solid fa-lock ml-auto text-gray-400"></i>
        </div>
    );

    return (
        <aside className="w-64 bg-white h-full flex flex-col p-4 border-r border-gray-200">
            <div className="flex flex-col gap-8">
                {/* Law Tools Section */}
                <section className="flex flex-col gap-4">
                    <h2 className="text-lg font-semibold text-gray-700">Law Tools</h2>
                    <nav className="flex flex-col gap-2">
                        {plan === 'Pro' ? (
                            <>
                                <Link
                                    href="/lawtools/research"
                                    className={`flex items-center gap-4 p-2 rounded ${
                                        activeLink === '/lawtools/research'
                                            ? 'bg-blue-100 text-blue-950'
                                            : 'hover:bg-blue-100 text-gray-700'
                                    }`}
                                >
                                    <i className="fa-solid fa-gavel text-gray-600"></i>
                                    <span>Legal Research</span>
                                </Link>
                                <Link
                                    href="/lawtools/casemanagement"
                                    className={`flex items-center gap-4 p-2 rounded ${
                                        activeLink === '/lawtools/casemanagement'
                                            ? 'bg-blue-100 text-blue-950'
                                            : 'hover:bg-blue-100 text-gray-700'
                                    }`}
                                >
                                    <i className="fa-solid fa-folder-open text-gray-600"></i>
                                    <span>Case Management</span>
                                </Link>
                                <Link
                                    href="/lawtools/documentdrafting"
                                    className={`flex items-center gap-4 p-2 rounded ${
                                        activeLink === '/lawtools/documentdrafting'
                                            ? 'bg-blue-100 text-blue-950'
                                            : 'hover:bg-blue-100 text-gray-700'
                                    }`}
                                >
                                    <i className="fa-solid fa-file-alt text-gray-600"></i>
                                    <span>Document Drafting</span>
                                </Link>
                            </>
                        ) : (
                            <>
                                {renderLockedLink('Legal Research', 'fa-solid fa-gavel')}
                                {renderLockedLink('Case Management', 'fa-solid fa-folder-open')}
                                {renderLockedLink('Document Drafting', 'fa-solid fa-file-alt')}
                            </>
                        )}
                    </nav>
                </section>

                {/* AI Law Tools Section */}
                <section className="flex flex-col gap-4">
                    <h2 className="text-lg font-semibold text-gray-700">AI Law Tools</h2>
                    <nav className="flex flex-col gap-2">
                        {plan === 'Pro' ? (
                            <>
                                <Link
                                    href="/ailawtools/analysis"
                                    className={`flex items-center gap-4 p-2 rounded ${
                                        activeLink === '/ailawtools/analysis'
                                            ? 'bg-blue-100 text-blue-950'
                                            : 'hover:bg-blue-100 text-gray-700'
                                    }`}
                                >
                                    <i className="fa-solid fa-brain text-gray-600"></i>
                                    <span>Legal Analysis</span>
                                </Link>
                                <Link
                                    href="/ailawtools/contractreview"
                                    className={`flex items-center gap-4 p-2 rounded ${
                                        activeLink === '/ailawtools/contractreview'
                                            ? 'bg-blue-100 text-blue-950'
                                            : 'hover:bg-blue-100 text-gray-700'
                                    }`}
                                >
                                    <i className="fa-solid fa-robot text-gray-600"></i>
                                    <span>Contract Review</span>
                                </Link>
                                <Link
                                    href="/ailawtools/predictive"
                                    className={`flex items-center gap-4 p-2 rounded ${
                                        activeLink === '/ailawtools/predictive'
                                            ? 'bg-blue-100 text-blue-950'
                                            : 'hover:bg-blue-100 text-gray-700'
                                    }`}
                                >
                                    <i className="fa-solid fa-chart-line text-gray-600"></i>
                                    <span>Predictive Analytics</span>
                                </Link>
                            </>
                        ) : (
                            <>
                                {renderLockedLink('Legal Analysis', 'fa-solid fa-brain')}
                                {renderLockedLink('Contract Review', 'fa-solid fa-robot')}
                                {renderLockedLink('Predictive Analytics', 'fa-solid fa-chart-line')}
                            </>
                        )}
                    </nav>
                </section>

                {/* AI Law Simulation Section */}
                <section className="flex flex-col gap-4">
                    <h2 className="text-lg font-semibold text-gray-700">AI Law Simulation</h2>
                    <nav className="flex flex-col gap-2">
                        {/* Simulate a Case - Available to all users */}
                        <Link
                            href="/admin/case"
                            className={`flex items-center gap-4 p-2 rounded ${
                                activeLink === '/admin/case'
                                    ? 'bg-blue-100 text-blue-950'
                                    : 'hover:bg-blue-100 text-gray-700'
                            }`}
                        >
                            <i className="fa-solid fa-globe text-gray-600"></i>
                            <span>Simulate a Case</span>
                        </Link>

                        {/* LSAT/BAR Prep - Available to all users */}
                        <Link
                            href="/ailawtools/examprep"
                            className={`flex items-center gap-4 p-2 rounded ${
                                activeLink === '/ailawtools/examprep'
                                    ? 'bg-blue-100 text-blue-950'
                                    : 'hover:bg-blue-100 text-gray-700'
                            }`}
                        >
                            <i className="fa-solid fa-flask text-gray-600"></i>
                            <span>LSAT/BAR Prep</span>
                        </Link>
                    </nav>
                </section>

                {/* User Info Section */}
                <section className="flex items-center gap-2 p-4 mt-auto">
                    <div className="flex flex-col">
                        <span className="font-semibold text-blue-900">
                            {currentUser?.displayName || 'User'}
                        </span>
                        <span className="text-xs text-gray-500">
                            {currentUser?.email || 'user@example.com'}
                        </span>
                    </div>
                    <span
                        className={`ml-6 text-xs px-2 py-1 rounded-full capitalize ${
                            plan === 'Pro'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-green-100 text-green-700'
                        }`}
                    >
                        {plan}
                    </span>
                </section>
            </div>
        </aside>
    );
}
