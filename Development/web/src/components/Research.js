'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LawResearch() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsLoading(true);

        try {
            // Mocking the API call with a timeout
            await new Promise(res => setTimeout(res, 1000)); 

            // Example search result
            const results = [
                { title: 'Case 1: Roe v. Wade', summary: 'A landmark decision by the U.S. Supreme Court...' },
                { title: 'Case 2: Brown v. Board of Education', summary: 'A pivotal case in the Civil Rights Movement...' }
            ];

            setSearchResults(results);

        } catch (error) {
            console.error("Error fetching legal research results:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white h-full flex flex-col p-4 border-r border-gray-200">
                <div className="flex flex-col gap-8">
                    <section className="flex flex-col gap-4">
                        <h2 className="text-lg font-semibold text-gray-700">Law Tools</h2>
                        <nav className="flex flex-col gap-2">
                            <Link href="/legal-research" className={`flex items-center gap-4 p-2 rounded bg-blue-100 ${router.pathname === '/legal-research' ? 'bg-blue-100 text-blue-950' : 'text-gray-700'}`}>
                                <i className="fa-solid fa-gavel text-gray-600"></i>
                                <span>Legal Research</span>
                            </Link>
                            <Link href="/case-management" className={`flex items-center gap-4 p-2 rounded hover:bg-blue-100 ${router.pathname === '/case-management' ? 'bg-blue-100 text-blue-950' : 'text-gray-700'}`}>
                                <i className="fa-solid fa-folder-open text-gray-600"></i>
                                <span>Case Management</span>
                            </Link>
                            <Link href="/document-drafting" className={`flex items-center gap-4 p-2 rounded hover:bg-blue-100 ${router.pathname === '/document-drafting' ? 'bg-blue-100 text-blue-950' : 'text-gray-700'}`}>
                                <i className="fa-solid fa-file-alt text-gray-600"></i>
                                <span>Document Drafting</span>
                            </Link>
                        </nav>
                    </section>
                    <section className="flex flex-col gap-4">
                        <h2 className="text-lg font-semibold text-gray-700">AI Law Tools</h2>
                        <nav className="flex flex-col gap-2">
                            <Link href="/ai-legal-analysis" className={`flex items-center gap-4 p-2 rounded hover:bg-blue-100 ${router.pathname === '/ai-legal-analysis' ? 'bg-blue-100 text-blue-950' : 'text-gray-700'}`}>
                                <i className="fa-solid fa-brain text-gray-600"></i>
                                <span>AI Legal Analysis</span>
                            </Link>
                            <Link href="/ai-contract-review" className={`flex items-center gap-4 p-2 rounded hover:bg-blue-100 ${router.pathname === '/ai-contract-review' ? 'bg-blue-100 text-blue-950' : 'text-gray-700'}`}>
                                <i className="fa-solid fa-robot text-gray-600"></i>
                                <span>AI Contract Review</span>
                            </Link>
                            <Link href="/ai-predictive-analytics" className={`flex items-center gap-4 p-2 rounded hover:bg-blue-100 ${router.pathname === '/ai-predictive-analytics' ? 'bg-blue-100 text-blue-950' : 'text-gray-700'}`}>
                                <i className="fa-solid fa-chart-line text-gray-600"></i>
                                <span>AI Predictive Analytics</span>
                            </Link>
                        </nav>
                    </section>
                    <section className="flex flex-col gap-4">
                        <h2 className="text-lg font-semibold text-gray-700">AI Law Simulation</h2>
                        <nav className="flex flex-col gap-2">
                            <Link href="/admin" className={`flex items-center gap-4 p-2 rounded hover:bg-blue-100 ${router.pathname === '/ai-law-simulation' ? 'hover:bg-blue-100 text-blue-950' : 'text-gray-700'}`}>
                                <i className="fa-solid fa-flask text-gray-600"></i>
                                <span>Simulate a Case</span>
                            </Link>
                        </nav>
                    </section>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col items-center p-4 bg-white">
                <header className="flex items-center justify-between w-full p-4 bg-white">
                    <button
                        onClick={() => router.back()}
                        className='flex items-center justify-center gap-4 bg-white border border-solid border-blue-950 px-4 py-2 rounded border-x-2 border-y-2 text-blue-950 duration-200 hover:bg-blue-950 hover:text-white'
                    >
                        <p className=''>&larr; Back</p>
                    </button>
                </header>
                <div className="flex-1 w-full max-w-4xl p-4 bg-gray-100 rounded-lg shadow-md">
                    <div className="flex flex-col h-full">
                        <div className="flex items-center mb-4">
                            <input
                                type="text"
                                className="flex-1 p-2 border border-gray-300 rounded"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Enter search terms..."
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSearch}
                                className="ml-4 p-2 bg-blue-500 text-white rounded"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Searching...' : 'Search'}
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-scroll p-4 rounded bg-white">
                            {searchResults.length > 0 ? (
                                searchResults.map((result, index) => (
                                    <div key={index} className="mb-4 p-4 border border-gray-300 rounded-lg">
                                        <h3 className="text-lg font-semibold text-blue-600">{result.title}</h3>
                                        <p className="text-gray-700">{result.summary}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">{isLoading ? 'Searching for legal cases...' : 'No results found. Try a different search term.'}</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
