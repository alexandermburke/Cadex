'use client';
import React, { useState } from 'react';
import Sidebar from '../Sidebar';
import { useRouter } from 'next/navigation';
import { pdfjs } from 'react-pdf';
import {
  PdfLoader,
  PdfHighlighter,
  Highlight,
  Popup,
} from 'react-pdf-highlighter';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function ContractReview() {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [highlights, setHighlights] = useState([]);
  const [reviewResult, setReviewResult] = useState('');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePdfUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      const fileUrl = URL.createObjectURL(file);
      setPdfUrl(fileUrl);
    } else {
      alert('Please upload a valid PDF file.');
    }
  };

  const handleAnalyzeContract = async () => {
    if (!pdfFile) return;

    setIsLoading(true);

    try {
      const reader = new FileReader();
      reader.readAsArrayBuffer(pdfFile);
      reader.onloadend = async () => {
        const arrayBuffer = reader.result;

        const response = await fetch('/api/analyze-contract', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/pdf',
          },
          body: arrayBuffer,
        });

        if (!response.ok) {
          throw new Error('Error during contract review');
        }

        const data = await response.json();
        const { analysis, highlights } = data;

        setReviewResult(analysis);
        setHighlights(highlights);
      };
    } catch (error) {
      console.error('Error during contract review:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const HighlightPopup = ({ highlight }) => (
    <div className="Highlight__popup">{highlight.comment.text}</div>
  );

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

            {/* PDF Upload */}
            <div className="mb-4">
              <input
                type="file"
                accept="application/pdf"
                onChange={handlePdfUpload}
                disabled={isLoading}
              />
            </div>

            {pdfUrl && (
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '600px',
                  border: '1px solid #ccc',
                  overflow: 'auto',
                }}
              >
                <PdfLoader url={pdfUrl} beforeLoad={<div>Loading PDF...</div>}>
                  {(pdfDocument) => (
                    <PdfHighlighter
                      pdfDocument={pdfDocument}
                      enableAreaSelection={false}
                      onScrollChange={() => {}}
                      scrollRef={(ref) => {
                        // Keep a reference to the scroll container if needed
                      }}
                      highlights={highlights}
                      onSelectionFinished={() => {
                        // Disable user selection
                        return null;
                      }}
                      highlightTransform={(
                        highlight,
                        index,
                        setTip,
                        hideTip,
                        viewportToScaled,
                        screenshot,
                        isScrolledTo
                      ) => {
                        const component = (
                          <Highlight
                            isScrolledTo={isScrolledTo}
                            position={highlight.position}
                            comment={highlight.comment}
                          />
                        );

                        return (
                          <Popup
                            popupContent={<HighlightPopup highlight={highlight} />}
                            onMouseOver={() => setTip(highlight)}
                            onMouseOut={hideTip}
                            key={index}
                          >
                            {component}
                          </Popup>
                        );
                      }}
                      pdfScaleValue="page-width"
                      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                    />
                  )}
                </PdfLoader>
              </div>
            )}

            <button
              onClick={handleAnalyzeContract}
              className="mt-4 border border-solid border-blue-950 bg-white text-blue-950 px-4 py-2 rounded-md duration-200 hover:bg-blue-950 hover:text-white"
              disabled={isLoading || !pdfFile}
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
                <p className="text-gray-400">
                  {isLoading
                    ? 'Reviewing the contract...'
                    : 'Upload a PDF and click "Review Contract" to get started.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
