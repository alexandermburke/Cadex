'use client';
import React, { useState } from 'react';
import Sidebar from '../Sidebar';
import { useRouter } from 'next/navigation';

export default function ContractReview() {
  const [contractText, setContractText] = useState('');
  const [reviewResult, setReviewResult] = useState('');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAnalyzeContract = async () => {
    if (!contractText.trim()) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/analyze-contract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contractText }),
      });

      if (!response.ok) {
        throw new Error('Error during contract review');
      }

      const data = await response.json();
      const { analysis } = data;

      setReviewResult(analysis);
    } catch (error) {
      console.error('Error during contract review:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      {isSidebarVisible && <Sidebar activeLink="/ailawtools/contractreview" />}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center p-4 bg-white">
        <div className="flex-1 w-full max-w-4xl p-4 bg-gray-100 rounded-lg shadow-md">
          <div className="flex flex-col h-full">
            {/* Hide button at the top left */}
            <div className="flex items-start justify-start w-full mb-4">
              <button
                onClick={toggleSidebar}
                className="gap-4 border border-solid border-blue-950 bg-blue-950 text-white px-4 py-2 rounded-md duration-200 hover:bg-white hover:text-blue-950"
              >
                {isSidebarVisible ? 'Hide' : 'Show'}
              </button>
            </div>
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
              className="border border-solid border-blue-950 bg-white text-blue-950 px-4 py-2 rounded-md duration-200 hover:bg-blue-950 hover:text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Reviewing...' : 'Review Contract'}
            </button>
            <div className="flex-1 overflow-y-scroll p-4 mt-4 rounded bg-white">
              {reviewResult ? (
                <div className="mb-4 p-4 border border-gray-300 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-600">Review Result</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{reviewResult}</p>
                </div>
              ) : (
                <p className="text-gray-500">
                  {isLoading
                    ? 'Reviewing the contract...'
                    : 'Enter contract text and click "Review Contract" to get started.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
