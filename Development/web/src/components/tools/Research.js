// Research.js
'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar'; // Adjust the path as needed
import { useRouter } from 'next/navigation';

// Import Firestore functions
import { db, storage } from '@/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

// Import React Icons and Framer Motion
import { FaBars, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function Research() {
    const { currentUser, userDataObj } = useAuth(); // Include userDataObj for plan check
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [savedCases, setSavedCases] = useState([]); // State for saved cases
    const [selectedCase, setSelectedCase] = useState(null); // State to store the selected case
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);

    // Typing animation states
    const [placeholderText, setPlaceholderText] = useState('');
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const [currentCharIndex, setCurrentCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    // Array of placeholder phrases
    const placeholderPhrases = [
        'Intellectual property...          ',
        'Enter search terms...          ',
        'The People of the State of California v. Orenthal James Simpson...          ',
        'Roe v. Wade...          ',
        'Ferrari S.p.A v. Roberts...          ',
        'Dodge v. Ford Motor Co....          ',
        'First Amendment cases...          ',
        'Environmental law...          ',
        'Privacy laws...          ',
        'Patent infringement...          ',
        'Antitrust litigation...          '
    ];

    // Typing animation effect
    useEffect(() => {
        let typingTimeout;

        const typingSpeed = 15;      // Typing speed in ms
        const deletingSpeed = 10;    // Deleting speed in ms
        const pauseDuration = 100;    // Pause before deleting in ms
        const initialDelay = 75;      // Initial delay before typing starts
        const nextPhraseDelay = 10000;   // Delay before typing next phrase

        const handleTyping = () => {
            const currentPhrase = placeholderPhrases[currentPhraseIndex];
            if (isDeleting) {
                if (currentCharIndex > 0) {
                    setPlaceholderText(currentPhrase.substring(0, currentCharIndex - 1));
                    setCurrentCharIndex(currentCharIndex - 1);
                    typingTimeout = setTimeout(handleTyping, deletingSpeed);
                } else {
                    setIsDeleting(false);
                    setCurrentPhraseIndex((currentPhraseIndex + 1) % placeholderPhrases.length);
                    typingTimeout = setTimeout(handleTyping, nextPhraseDelay);
                }
            } else {
                if (currentCharIndex < currentPhrase.length) {
                    setPlaceholderText(currentPhrase.substring(0, currentCharIndex + 1));
                    setCurrentCharIndex(currentCharIndex + 1);
                    typingTimeout = setTimeout(handleTyping, typingSpeed);
                } else {
                    typingTimeout = setTimeout(() => {
                        setIsDeleting(true);
                        handleTyping();
                    }, pauseDuration);
                }
            }
        };

        typingTimeout = setTimeout(handleTyping, initialDelay);

        // Cleanup timeout on unmount
        return () => clearTimeout(typingTimeout);
    }, [currentCharIndex, isDeleting, currentPhraseIndex]);

    // Fetch saved cases when the component mounts
    useEffect(() => {
        const fetchSavedCases = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'savedCases'));
                const cases = [];
                querySnapshot.forEach((doc) => {
                    cases.push({ id: doc.id, ...doc.data() });
                });
                setSavedCases(cases);
            } catch (error) {
                console.error('Error fetching saved cases:', error);
            }
        };

        fetchSavedCases();
    }, []);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsLoading(true);

        try {
            const response = await fetch('/api/research', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ searchQuery }),
            });

            if (!response.ok) {
                throw new Error('Error fetching search results');
            }

            const data = await response.json();

            if (data.error) {
                console.error('API Error:', data.details);
                setSearchResults([]);
            } else {
                setSearchResults(data.searchResults);
            }
        } catch (error) {
            console.error('Error fetching legal research results:', error);
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    const handleCaseClick = (caseItem) => {
        setSelectedCase(caseItem);
    };

    const closeModal = () => {
        setSelectedCase(null);
    };

    // Function to save a case to Firestore
    const saveCase = async (caseItem) => {
        try {
            const docRef = await addDoc(collection(db, 'savedCases'), caseItem);
            console.log('Document written with ID: ', docRef.id);
            setSavedCases([...savedCases, { id: docRef.id, ...caseItem }]);
        } catch (error) {
            console.error('Error adding document: ', error);
        }
    };

    // Function to unsave a case from Firestore
    const unsaveCase = async (caseId) => {
        try {
            await deleteDoc(doc(db, 'savedCases', caseId));
            setSavedCases(savedCases.filter((caseItem) => caseItem.id !== caseId));
        } catch (error) {
            console.error('Error removing document: ', error);
        }
    };

    // Only allow access if user is logged in
    if (!currentUser) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-700">
                    Please <a href="/login" className="text-blue-950 underline">log in</a> to use the Research tool.
                </p>
            </div>
        );
    }

    const isProUser = userDataObj?.billing?.plan === 'Pro';

    return (
        <div className="flex h-screen bg-blue-100">
            {/* Sidebar */}
            {isSidebarVisible && <Sidebar activeLink="/lawtools/research" />}

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col items-center p-4 bg-white">
                <div className="flex-1 w-full max-w-4xl p-4 bg-gray-100 max-h-128 rounded-lg shadow-md">
                    <div className="flex flex-col h-full">
                        {/* Header with Animated Toggle Sidebar Button */}
                        <header className="flex items-center justify-between w-full mb-4 bg-transparent">
                            <div className="flex items-center">
                                {/* Animated Toggle Sidebar Button */}
                                <button
                                    onClick={toggleSidebar}
                                    className=" bg-blue-950 text-white p-2 rounded-md duration-200 hover:bg-blue-900 flex items-center justify-center"
                                    aria-label={isSidebarVisible ? 'Hide Sidebar' : 'Show Sidebar'}
                                >
                                    <AnimatePresence mode="wait" initial={false}>
                                        {isSidebarVisible ? (
                                            <motion.div
                                                key="close-icon"
                                                initial={{ rotate: 90, opacity: 0 }}
                                                animate={{ rotate: 0, opacity: 1 }}
                                                exit={{ rotate: -90, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <FaTimes size={20} />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="menu-icon"
                                                initial={{ rotate: -90, opacity: 0 }}
                                                animate={{ rotate: 0, opacity: 1 }}
                                                exit={{ rotate: 90, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <FaBars size={20} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </button>

                                {/* Pro+ Mode Button (Optional) */}
                                {isProUser && (
                                    <button
                                        onClick={() => router.push('/lawtools/research/full-mode')}
                                        className="ml-4 p-2 border border-solid border-emerald-400 bg-emerald-400 text-white rounded-md duration-200 hover:bg-white hover:text-emerald-400 flex items-center justify-center"
                                        aria-label="Pro+ Mode"
                                    >
                                        Pro+ Mode
                                    </button>
                                )}
                            </div>
                        </header>

                        {/* Search Input and Button */}
                        <div className="flex items-center mb-4">
                            <input
                                type="text"
                                className="flex-1 p-2 border border-gray-300 rounded capitalize"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder={placeholderText || ''}
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSearch}
                                className="ml-4 p-2 border border-solid border-blue-950 bg-white text-blue-950 px-4 py-2 rounded-md duration-200 hover:bg-blue-950 hover:text-white"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Searching...' : 'Search'}
                            </button>
                        </div>

                        {/* Saved Cases Section */}
                        {savedCases.length > 0 && (
                            <div className="mb-4 p-4 rounded bg-white">
                                <h2 className="text-xl font-bold mb-2">Saved Cases</h2>
                                {savedCases.map((savedCase) => (
                                    <div key={savedCase.id} className="mb-2 p-2 border border-gray-300 rounded-lg">
                                        <div className="flex items-start justify-between">
                                            <div
                                                className="cursor-pointer hover:bg-gray-100"
                                                onClick={() => handleCaseClick(savedCase)}
                                            >
                                                <h3 className="text-lg font-semibold text-blue-600">{savedCase.title}</h3>
                                                <p className="text-gray-700 mt-1">{savedCase.summary}</p>
                                            </div>
                                            <button
                                                onClick={() => unsaveCase(savedCase.id)}
                                                className="ml-4 mt-1 p-2 border border-solid border-red-600 bg-red-600 text-white px-3 py-1 rounded duration-200 hover:bg-white hover:text-red-600"
                                            >
                                                Unsave
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Search Results */}
                        <div className="flex-1 overflow-y-scroll p-4 rounded bg-white">
                            {searchResults.length > 0 ? (
                                searchResults.map((result, index) => (
                                    <div
                                        key={index}
                                        className="mb-4 p-4 border border-gray-300 rounded-lg"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div
                                                className="cursor-pointer hover:bg-gray-100"
                                                onClick={() => handleCaseClick(result)}
                                            >
                                                <h3 className="text-lg font-semibold text-blue-600">{result.title}</h3>
                                                <p className="text-gray-700 mt-1">{result.summary}</p>
                                            </div>
                                            <button
                                                onClick={() => saveCase(result)}
                                                className="ml-4 mt-1 p-2 border border-solid border-green-600 bg-green-600 text-white px-3 py-1 rounded duration-200 hover:bg-white hover:text-green-600"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">
                                    {isLoading
                                        ? 'Searching for legal cases...'
                                        : 'No results found. Try a different search term.'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Case Details Modal */}
            {selectedCase && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">
                            {selectedCase.fullCaseName || selectedCase.title}
                        </h2>

                        {selectedCase.importantDates && (
                            <p className="text-gray-700 mb-2">
                                <strong>Important Dates:</strong> {selectedCase.importantDates}
                            </p>
                        )}

                        {selectedCase.citations && (
                            <p className="text-gray-700 mb-2">
                                <strong>Citations:</strong> {selectedCase.citations}
                            </p>
                        )}

                        {selectedCase.relatedCases && (
                            <p className="text-gray-700 mb-2">
                                <strong>Related Cases:</strong> {selectedCase.relatedCases}
                            </p>
                        )}

                        {selectedCase.decision && (
                            <p className="text-gray-700 mb-2">
                                <strong>Decision:</strong> {selectedCase.decision}
                            </p>
                        )}

                        <p className="text-gray-700 mb-4">{selectedCase.summary}</p>
                        <button
                            onClick={closeModal}
                            className="mt-4 p-2 border border-solid border-blue-950 bg-blue-950 text-white px-4 py-2 rounded-md duration-200 hover:bg-white hover:text-blue-950"
                        >
                            Close
                        </button>
                        {selectedCase.link && (
                            <a
                                href={selectedCase.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline m-4"
                            >
                                Read Full Article
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
