'use client';
import React, { useState } from 'react';
import Sidebar from '../Sidebar'; // Import Sidebar component
import { useRouter } from 'next/navigation';

export default function CaseManagement() {
    const [caseTitle, setCaseTitle] = useState('');
    const [caseDetails, setCaseDetails] = useState('');
    const [caseList, setCaseList] = useState([]);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true); // State to manage sidebar visibility
    const [selectedCase, setSelectedCase] = useState(null); // State to manage the selected case
    const router = useRouter();

    const handleAddCase = () => {
        if (!caseTitle.trim() || !caseDetails.trim()) return;

        const newCase = { title: caseTitle, details: caseDetails };
        setCaseList([...caseList, newCase]);
        setCaseTitle('');
        setCaseDetails('');
    };

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    const openCase = (caseItem) => {
        setSelectedCase(caseItem);
    };

    const closeCase = () => {
        setSelectedCase(null);
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            {isSidebarVisible && <Sidebar activeLink="/lawtools/casemanagement" />} {/* Pass activeLink as a prop */}

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col items-center p-4 bg-white">
              
                <div className="flex-1 w-full max-w-4xl p-4 bg-gray-100 rounded-lg shadow-md">
                <header className="flex items-center justify-between w-full mb-4 bg-transparent">
                    <button
                        onClick={toggleSidebar}
                        className="flex items-center justify-center gap-4 border border-solid border-blue-950 border-x-2 border-y-2 bg-blue-950 text-white px-4 py-2 rounded-md duration-200 hover:bg-white hover:text-blue-950"
                    >
                        {isSidebarVisible ? 'Hide' : 'Show'}
                    </button>
                </header>
                    <div className="flex flex-col h-full">
                        <div className="flex items-center mb-4">
                            <input
                                type="text"
                                className="flex-1 p-2 border border-gray-300 rounded"
                                value={caseTitle}
                                onChange={(e) => setCaseTitle(e.target.value)}
                                placeholder="Enter case title..."
                            />
                        </div>
                        <div className="flex items-center mb-4">
                            <textarea
                                className="flex-1 p-2 border border-gray-300 rounded"
                                value={caseDetails}
                                onChange={(e) => setCaseDetails(e.target.value)}
                                placeholder="Enter case details..."
                                rows="4"
                            ></textarea>
                        </div>
                        <button
                            onClick={handleAddCase}
                            className=" border border-solid border-blue-950 border-x-2 border-y-2 bg-white text-blue-950 px-4 py-2 rounded-md duration-200 hover:bg-blue-950 hover:text-white"
                        >
                            Add Case
                        </button>
                        <div className="flex-1 overflow-y-scroll p-4 mt-4 rounded bg-white">
                            {caseList.length > 0 ? (
                                caseList.map((c, index) => (
                                    <div
                                        key={index}
                                        className="mb-4 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100"
                                        onClick={() => openCase(c)}
                                    >
                                        <h3 className="text-lg font-semibold text-blue-600">{c.title}</h3>
                                        <p className="text-gray-700">{c.details}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No cases added yet. Start by adding a new case.</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Case Details Modal */}
            {selectedCase && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
                        <h2 className="text-2xl font-bold mb-4">{selectedCase.title}</h2>
                        <p className="text-gray-700 mb-4">{selectedCase.details}</p>
                        <button
                            onClick={closeCase}
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
