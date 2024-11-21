'use client';
import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar'; // Import Sidebar component
import { useRouter } from 'next/navigation';
import { FaBars, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function LegalAnalysis() {
  const [inputText, setInputText] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [typedResult, setTypedResult] = useState(''); // State to hold the animated typing result
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  // Function to handle API call to ChatGPT
  const handleAnalyzeText = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setAnalysisResult('');
    setTypedResult('');

    try {
      const response = await fetch('/api/chatgpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputText }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze text');
      }

      const { analysis } = await response.json();
      setAnalysisResult(analysis);
      // Removed the automatic opening of the modal here
      // openModal();
    } catch (error) {
      console.error('Error during legal analysis:', error);
      setAnalysisResult('An error occurred during the analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  // Typing effect hook
  useEffect(() => {
    if (analysisResult) {
      // Reset typedResult when analysisResult changes
      setTypedResult('');
      let index = 0;
      const typingInterval = setInterval(() => {
        setTypedResult((prev) => prev + analysisResult[index]);
        index++;
        if (index >= analysisResult.length) {
          clearInterval(typingInterval);
        }
      }, 50); // Adjust speed of typing animation here (50ms per character)

      // Cleanup function to clear the interval
      return () => clearInterval(typingInterval);
    }
  }, [analysisResult]);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Removed resetting typedResult to keep the analysis text saved
    // setTypedResult('');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      {isSidebarVisible && (
        <Sidebar activeLink="/ailawtools/analysis" />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center p-4 bg-white">
                <div className="flex-1 w-full max-w-4xl p-4 bg-gray-100 max-h-128 rounded-lg shadow-md">
                    <div className="flex flex-col h-full">
            {/* Hide button at the top left */}
            <div className="flex items-start justify-start w-full mb-4">
                  {/* Animated Toggle Sidebar Button */}
                  <button
                                    onClick={toggleSidebar}
                                         className=" bg-transparent text-blue-950 p-2 rounded duration-200 flex items-center justify-center"
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
            </div>
            <div className="flex items-center mb-4">
              <textarea
                className="flex-1 p-2 border border-gray-300 rounded"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter legal text for analysis..."
                rows="8"
                disabled={isLoading}
              ></textarea>
            </div>
            <button
              onClick={handleAnalyzeText}
              className="border border-solid border-blue-950 bg-white text-blue-950 px-4 py-2 rounded-md duration-200 hover:bg-blue-950 hover:text-white"
              disabled={isLoading || !inputText.trim()}
            >
              {isLoading ? 'Analyzing...' : 'Analyze Text'}
            </button>
            <div
              className="flex-1 overflow-y-scroll p-4 mt-4 rounded bg-white cursor-pointer"
              onClick={openModal}
            >
              {analysisResult ? (
                <div className="mb-4 p-4 border border-gray-300 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-600">Analysis Result</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {typedResult}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">
                  {isLoading
                    ? 'Analyzing the text...'
                    : 'Enter some legal text and click "Analyze Text" to get started.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Analysis Result Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Analysis Report</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {typedResult}
            </p>
            <button
              onClick={closeModal}
              className="mt-4 border border-solid border-blue-950 bg-blue-950 text-white px-4 py-2 rounded-md duration-200 hover:bg-white hover:text-blue-950"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
