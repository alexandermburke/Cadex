'use client';
import React, { useState } from 'react';
import Sidebar from '../Sidebar'; // Import Sidebar component
import { useRouter } from 'next/navigation';

export default function DocumentDrafting() {
    const [docTitle, setDocTitle] = useState('');
    const [docContent, setDocContent] = useState('');
    const [docList, setDocList] = useState([]);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true); // State to manage sidebar visibility
    const [selectedDoc, setSelectedDoc] = useState(null); // State to manage the selected document
    const router = useRouter();

    const handleAddDocument = () => {
        if (!docTitle.trim() || !docContent.trim()) return;

        const newDocument = { title: docTitle, content: docContent };
        setDocList([...docList, newDocument]);
        setDocTitle('');
        setDocContent('');
    };

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    const openDocument = (doc) => {
        setSelectedDoc(doc);
    };

    const closeDocument = () => {
        setSelectedDoc(null);
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            {isSidebarVisible && <Sidebar activeLink="/lawtools/documentdrafting" />} {/* Pass activeLink as a prop */}

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col items-center p-4 bg-white">
                <div className="flex-1 w-full max-w-4xl p-4 bg-gray-100 max-h-128 rounded-lg shadow-md">
                    <div className="flex flex-col h-full">
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
                                value={docTitle}
                                onChange={(e) => setDocTitle(e.target.value)}
                                placeholder="Enter document title..."
                            />
                        </div>
                        <div className="flex items-center mb-4">
                            <textarea
                                className="flex-1 p-2 border border-gray-300 rounded"
                                value={docContent}
                                onChange={(e) => setDocContent(e.target.value)}
                                placeholder="Enter document content..."
                                rows="8"
                            ></textarea>
                        </div>
                        <button
                            onClick={handleAddDocument}
                            className=" border border-solid border-blue-950 border-x-2 border-y-2 bg-white text-blue-950 px-4 py-2 rounded-md duration-200 hover:bg-blue-950 hover:text-white"
                        >
                            Add Document
                        </button>
                        <div className="flex-1 overflow-y-scroll p-4 mt-4 rounded bg-white">
                            {docList.length > 0 ? (
                                docList.map((doc, index) => (
                                    <div
                                        key={index}
                                        className="mb-4 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100"
                                        onClick={() => openDocument(doc)}
                                    >
                                        <h3 className="text-lg font-semibold text-blue-600">{doc.title}</h3>
                                        <p className="text-gray-700 truncate">{doc.content}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No documents drafted yet. Start by drafting a new document.</p>
                            )}
                        </div>
                    </div>
                </div>
                </div>
            </main>

            {/* Document Details Modal */}
            {selectedDoc && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
                        <h2 className="text-2xl font-bold mb-4">{selectedDoc.title}</h2>
                        <p className="text-gray-700 mb-4 whitespace-pre-wrap">{selectedDoc.content}</p>
                        <button
                            onClick={closeDocument}
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
