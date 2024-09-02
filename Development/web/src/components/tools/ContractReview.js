'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ContractReview() {
    const [contractText, setContractText] = useState(''); // Text input for contract details
    const [reviewResult, setReviewResult] = useState(''); // Result from the AI analysis
    const [isSidebarVisible, setIsSidebarVisible] = useState(true); // State to manage sidebar visibility
    const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility
    const [isLoading, setIsLoading] = useState(false); // State to manage loading state
    const router = useRouter();

    const handleAnalyzeContract = async () => {
        if (!contractText.trim()) return;

        setIsLoading(true);

        try {
            // Simulate an API call to an AI-powered contract analysis service
            await new Promise((res) => setTimeout(res, 1000));

            // Example AI-generated review result
            const result = `Contract Analysis Result: \n\n"${contractText}"\n\nThe contract contains clauses that might need further review regarding termination conditions and liability limitations. The AI suggests consulting with a legal expert to ensure compliance with relevant laws.`;

            setReviewResult(result);
            setIsModalOpen(true); // Open the modal when analysis is complete
        } catch (error) {
            console.error('Error during contract review:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            {isSidebarVisible && (
                <aside className="w-64 bg-white h-full flex flex-col p-4 border-r border-gray-200">
                    <div className="flex flex-col gap-8">
                        <section className="flex flex-col gap-4">
                            <h2 className="text-lg font-semibold text-gray-700">Law Tools</h2>
                            <nav className="flex flex-col gap-2">
                                <Link href="/lawtools/research" className={`flex items-center gap-4 p-2 rounded hover:bg-blue-100 ${router.pathname === '/legal-research' ? 'bg-blue-100 text-blue-950' : 'text-gray-700'}`}>
                                    <i className="fa-solid fa-gavel text-gray-600"></i>
                                    <span>Legal Research</span>
                                </Link>
                                <Link href="/lawtools/casemanagement" className={`flex items-center gap-4 p-2 rounded hover:bg-blue-100 ${router.pathname === '/case-management' ? 'bg-blue-100 text-blue-950' : 'text-gray-700'}`}>
                                    <i className="fa-solid fa-folder-open text-gray-600"></i>
                                    <span>Case Management</span>
                                </Link>
                                <Link href="/lawtools/documentdrafting" className={`flex items-center gap-4 p-2 rounded hover:bg-blue-100 ${router.pathname === '/document-drafting' ? 'bg-blue-100 text-blue-950' : 'text-gray-700'}`}>
                                    <i className="fa-solid fa-file-alt text-gray-600"></i>
                                    <span>Document Drafting</span>
                                </Link>
                            </nav>
                        </section>
                        <section className="flex flex-col gap-4">
                            <h2 className="text-lg font-semibold text-gray-700">AI Law Tools</h2>
                            <nav className="flex flex-col gap-2">
                                <Link href="/ailawtools/analysis" className={`flex items-center gap-4 p-2 rounded hover:bg-blue-100 ${router.pathname === '/ai-legal-analysis' ? 'bg-blue-100 text-blue-950' : 'text-gray-700'}`}>
                                    <i className="fa-solid fa-brain text-gray-600"></i>
                                    <span>AI Legal Analysis</span>
                                </Link>
                                <Link href="/ailawtools/contractreview" className={`flex items-center gap-4 p-2 rounded bg-blue-100 ${router.pathname === '/ai-contract-review' ? 'bg-blue-100 text-blue-950' : 'text-gray-700'}`}>
                                    <i className="fa-solid fa-robot text-gray-600"></i>
                                    <span>AI Contract Review</span>
                                </Link>
                                <Link href="/ailawtools/predictive" className={`flex items-center gap-4 p-2 rounded hover:bg-blue-100 ${router.pathname === '/ai-predictive-analytics' ? 'bg-blue-100 text-blue-950' : 'text-gray-700'}`}>
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
            )}

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col items-center p-4 bg-white">
                <div className="flex-1 w-full max-w-4xl p-4 bg-gray-100 rounded-lg shadow-md">
                    <div className="flex flex-col h-full">
                        <div className="flex items-center mb-4">
                            <textarea
                                className="flex-1 p-2 border border-gray-300 rounded"
                                value={contractText}
                                onChange={(e) => setContractText(e.target.value)}
                                placeholder="Enter contract text for review..."
                                rows="8"
                                disabled={isLoading}
                            ></textarea>
                        </div>
                        <button
                            onClick={handleAnalyzeContract}
                            className="border border-solid border-blue-950 border-x-2 border-y-2 bg-white text-blue-950 px-4 py-2 rounded-md duration-200 hover:bg-blue-950 hover:text-white"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Reviewing...' : 'Review Contract'}
                        </button>
                        <div 
                            className="flex-1 overflow-y-scroll p-4 mt-4 rounded bg-white cursor-pointer"
                            onClick={() => setIsModalOpen(true)}
                        >
                            {reviewResult ? (
                                <div className="mb-4 p-4 border border-gray-300 rounded-lg">
                                    <h3 className="text-lg font-semibold text-blue-600">Review Result</h3>
                                    <p className="text-gray-700 whitespace-pre-wrap">{reviewResult}</p>
                                </div>
                            ) : (
                                <p className="text-gray-500">{isLoading ? 'Reviewing the contract...' : 'Enter contract text and click "Review Contract" to get started.'}</p>
                            )}
                        </div>
                        <div className="flex items-start justify-start w-full mt-4">
                            <button
                                onClick={toggleSidebar}
                                className='gap-4 border border-solid border-blue-950 border-x-2 border-y-2 bg-blue-950 text-white px-4 py-2 rounded-md duration-200 hover:bg-white hover:text-blue-950'
                            >
                                {isSidebarVisible ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Review Result Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
                        <h2 className="text-2xl font-bold mb-4">Contract Review Report</h2>
                        <p className="text-gray-700 whitespace-pre-wrap">{reviewResult}</p>
                        <button
                            onClick={closeModal}
                            className="mt-4 p-2 border border-solid border-blue-950 border-x-2 border-y-2 bg-blue-950 text-white px-4 py-2 rounded-md duration-200 hover:bg-white hover:text-blue-950"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
