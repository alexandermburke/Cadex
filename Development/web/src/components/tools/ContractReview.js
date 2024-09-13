'use client';
import React, { useState } from 'react';
import Sidebar from '../Sidebar';
import { useRouter } from 'next/navigation';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
// Set the workerSrc property
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function ContractReview() {
  const [contractText, setContractText] = useState('');
  const [reviewResult, setReviewResult] = useState('');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Traditional promise creation to replace Promise.withResolvers
  function createPromiseWithResolvers() {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  }
  
  // Function to analyze the contract text
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

  // Function to handle PDF file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      try {
        const reader = new FileReader();
        reader.onload = async () => {
          const typedarray = new Uint8Array(reader.result);
          const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
          let textContent = '';
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContentObj = await page.getTextContent();
            const pageText = textContentObj.items.map((item) => item.str).join(' ');
            textContent += pageText + '\n';
          }
          setContractText(textContent);
        };
        reader.readAsArrayBuffer(file);
      } catch (error) {
        console.error('Error reading PDF file:', error);
      }
    } else {
      alert('Please upload a valid PDF file.');
    }
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
            {/* File Upload Button */}
            <div className="flex items-center mb-4">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={isLoading}
                className="mb-2"
              />
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
                    : 'Enter contract text or upload a PDF and click "Review Contract" to get started.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
