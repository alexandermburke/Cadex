'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Simulation() {
    const [chatHistory, setChatHistory] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSend = async () => {
        if (!userInput.trim()) return;

        const userMessage = { role: 'user', content: userInput };
        const updatedChatHistory = [...chatHistory, userMessage];

        setChatHistory(updatedChatHistory);
        setUserInput('');
        setIsLoading(true);

        try {
            // Mocking the API call with a timeout
            await new Promise(res => setTimeout(res, 1000)); 

            const aiMessage = { role: 'assistant', content: 'AI Response: This is a simulated response from the AI.' };
            setChatHistory([...updatedChatHistory, aiMessage]);

            // Save chat history function should be here (if implemented)
        } catch (error) {
            console.error("Error fetching response from ChatGPT API:", error);
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
                            <Link href="/legal-research" className={`flex items-center gap-4 p-2 rounded hover:bg-blue-100 ${router.pathname === '/legal-research' ? 'bg-blue-100 text-blue-950' : 'text-gray-700'}`}>
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
                            <Link href="/admin" className={`flex items-center gap-4 p-2 rounded bg-blue-100 ${router.pathname === '/ai-law-simulation' ? 'bg-blue-100 text-blue-950' : 'text-gray-700'}`}>
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
                    <button
                        onClick={handleSend}
                        className='flex items-center justify-center gap-2 border border-solid border-white bg-slate-50 px-3 py-2 rounded text-blue-950 duration-200 hover:bg-blue-950 hover:text-white'
                    >
                        <p className=''>{isLoading ? 'Saving' : 'Save'}</p>
                        <i className="fa-solid fa-floppy-disk"></i>
                    </button>
                </header>
                <div className="flex-1 w-full max-w-4xl p-4 bg-gray-100 rounded-lg shadow-md">
                    <div className="flex flex-col h-full">
                        <div className="flex-1 overflow-y-scroll p-4 rounded bg-white">
                            {chatHistory.map((msg, index) => (
                                <div key={index} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                    <p className={`inline-block p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}>
                                        {msg.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex items-center">
                            <input
                                type="text"
                                className="flex-1 p-2 border border-gray-300 rounded"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Enter your response as an attorney..."
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSend}
                                className="ml-4 p-2 bg-blue-500 text-white rounded"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Loading...' : 'Send'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
