'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar({ activeLink }) {
    const router = useRouter();
    const { currentUser, userDataObj, isPaid } = useAuth()

    return (
        <aside className="w-64 bg-white h-full flex flex-col p-4 border-r border-gray-200">
            <div className="flex flex-col gap-8">
                <section className="flex flex-col gap-4">
                    <h2 className="text-lg font-semibold text-gray-700">Law Tools</h2>
                    <nav className="flex flex-col gap-2">
                        <Link href="/lawtools/research" className={`flex items-center gap-4 p-2 rounded ${activeLink === '/lawtools/research' ? 'bg-blue-100 text-blue-950' : 'hover:bg-blue-100 text-gray-700'}`}>
                            <i className="fa-solid fa-gavel text-gray-600"></i>
                            <span>Legal Research</span>
                        </Link>
                        <Link href="/lawtools/casemanagement" className={`flex items-center gap-4 p-2 rounded ${activeLink === '/lawtools/casemanagement' ? 'bg-blue-100 text-blue-950' : 'hover:bg-blue-100 text-gray-700'}`}>
                            <i className="fa-solid fa-folder-open text-gray-600"></i>
                            <span>Case Management</span>
                        </Link>
                        <Link href="/lawtools/documentdrafting" className={`flex items-center gap-4 p-2 rounded ${activeLink === '/lawtools/documentdrafting' ? 'bg-blue-100 text-blue-950' : 'hover:bg-blue-100 text-gray-700'}`}>
                            <i className="fa-solid fa-file-alt text-gray-600"></i>
                            <span>Document Drafting</span>
                        </Link>
                    </nav>
                </section>
                <section className="flex flex-col gap-4">
                    <h2 className="text-lg font-semibold text-gray-700">AI Law Tools</h2>
                    <nav className="flex flex-col gap-2">
                        <Link href="/ailawtools/analysis" className={`flex items-center gap-4 p-2 rounded ${activeLink === '/ailawtools/analysis' ? 'bg-blue-100 text-blue-950' : 'hover:bg-blue-100 text-gray-700'}`}>
                            <i className="fa-solid fa-brain text-gray-600"></i>
                            <span>Legal Analysis</span>
                        </Link>
                        <Link href="/ailawtools/contractreview" className={`flex items-center gap-4 p-2 rounded ${activeLink === '/ailawtools/contractreview' ? 'bg-blue-100 text-blue-950' : 'hover:bg-blue-100 text-gray-700'}`}>
                            <i className="fa-solid fa-robot text-gray-600"></i>
                            <span>Contract Review</span>
                        </Link>
                        <Link href="/ailawtools/predictive" className={`flex items-center gap-4 p-2 rounded ${activeLink === '/ailawtools/predictive' ? 'bg-blue-100 text-blue-950' : 'hover:bg-blue-100 text-gray-700'}`}>
                            <i className="fa-solid fa-chart-line text-gray-600"></i>
                            <span>Predictive Analytics</span>
                        </Link>
                    </nav>
                </section>
                <section className="flex flex-col gap-4">
                    <h2 className="text-lg font-semibold text-gray-700">AI Law Simulation</h2>
                    <nav className="flex flex-col gap-2">
                        <Link href="/admin/application" className={`flex items-center gap-4 p-2 rounded ${activeLink === '/admin' ? 'bg-blue-100 text-blue-950' : 'hover:bg-blue-100 text-gray-700'}`}>
                            <i className="fa-solid fa-flask text-gray-600"></i>
                            <span>Simulate a Case</span>
                        </Link>
                    </nav>
                </section>
            {/* New section at the bottom */}
            <section className="mr-40 flex items-center gap-2 p-4 mt-44">
                <div className="flex flex-col">
                    <span className="font-semibold text-blue-900">{currentUser?.displayName || 'User'}</span>
                    <span className="text-xs text-gray-500">{currentUser?.email || 'User'}</span>
                </div>
                <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full capitalize">{userDataObj?.billing.plan || 'User'}</span>
            </section>
            </div>
        </aside>
    );
}
