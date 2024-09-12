'use client';
import React, { useState } from 'react';
import Sidebar from '../Sidebar'; // Adjust the path as needed to point to your Sidebar component
import { useRouter } from 'next/navigation';

export default function Research() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true); // State to manage sidebar visibility
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

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    return (
        <div className="flex h-screen bg-blue-100">
            {/* Sidebar */}
            {isSidebarVisible && <Sidebar activeLink="/lawtools/research" />} {/* Pass activeLink as a prop */}

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col items-center p-4 bg-white">
                <header className="flex items-center justify-between w-full p-4 bg-white">
                    <button
                        onClick={toggleSidebar}
                        className='flex items-center justify-center gap-4 border border-solid border-blue-950 border-x-2 border-y-2 bg-blue-950 text-white px-4 py-2 rounded-md duration-200 hover:bg-white hover:text-blue-950'
                    >
                        {isSidebarVisible ? 'Hide' : 'Show'}
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
                                className="ml-4 p-2 border border-solid border-blue-950 border-x-2 border-y-2 bg-white text-blue-950 px-4 py-2 rounded-md duration-200 hover:bg-blue-950 hover:text-white"
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
