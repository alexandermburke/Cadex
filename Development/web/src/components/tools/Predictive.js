'use client';
import React, { useState } from 'react';
import Sidebar from '../Sidebar'; // Import the updated Sidebar component
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Predictive() {
    const [inputData, setInputData] = useState(''); // User input data for predictions
    const [predictionResult, setPredictionResult] = useState(''); // AI-generated prediction result
    const [isSidebarVisible, setIsSidebarVisible] = useState(true); // State to manage sidebar visibility
    const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility
    const [isLoading, setIsLoading] = useState(false); // State to manage loading state
    const [areChartsVisible, setAreChartsVisible] = useState(true); // Toggle charts visibility

    const handleGeneratePrediction = async () => {
        if (!inputData.trim()) return;

        setIsLoading(true);

        try {
            // Simulate an API call to an AI-powered predictive analytics service
            await new Promise((res) => setTimeout(res, 1000));

            // Example AI-generated prediction result
            const result = `Predictive Analytics Result: Based on the input data "${inputData}", the AI model predicts a potential increase in legal risks related to compliance issues. Recommended actions include reviewing the associated contracts and ensuring all legal requirements are met.`;

            setPredictionResult(result);
            setIsModalOpen(true); // Open the modal when prediction is complete
        } catch (error) {
            console.error('Error generating prediction:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    const toggleChartsVisibility = () => {
        setAreChartsVisible(!areChartsVisible);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    // Example chart data
    const lineChartData = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
            {
                label: 'Legal Risk Over Time',
                data: [3, 2, 2.5, 4, 5.5, 3.8, 5],
                borderColor: 'rgba(59, 130, 246, 1)',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                fill: true,
            },
        ],
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            {isSidebarVisible && <Sidebar activeLink="/ailawtools/predictive" />} {/* Pass activeLink as a prop */}

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col items-center p-4 bg-white">
                <header className="flex items-center justify-between w-full p-4 bg-white">
                    <button
                        onClick={toggleSidebar}
                        className="flex items-center justify-center gap-4 border border-solid border-blue-950 border-x-2 border-y-2 bg-blue-950 text-white px-4 py-2 rounded-md duration-200 hover:bg-white hover:text-blue-950"
                    >
                        {isSidebarVisible ? 'Hide' : 'Show'}
                    </button>
                    <button
                        onClick={toggleChartsVisibility}
                        className="ml-4 border border-solid border-blue-950 border-x-2 border-y-2 bg-white text-blue-950 px-4 py-2 rounded-md duration-200 hover:bg-blue-950 hover:text-white"
                    >
                        {areChartsVisible ? 'Hide Charts' : 'Show Charts'}
                    </button>
                </header>
                <div className="flex-1 w-full max-w-4xl p-4 bg-gray-100 rounded-lg shadow-md">
                    <div className="flex flex-col h-full">
                        <div className="flex items-center mb-4">
                            <textarea
                                className="flex-1 p-2 border border-gray-300 rounded"
                                value={inputData}
                                onChange={(e) => setInputData(e.target.value)}
                                placeholder="Enter data for predictive analytics..."
                                rows="8"
                                disabled={isLoading}
                            ></textarea>
                        </div>
                        <button
                            onClick={handleGeneratePrediction}
                            className="border border-solid border-blue-950 border-x-2 border-y-2 bg-white text-blue-950 px-4 py-2 rounded-md duration-200 hover:bg-blue-950 hover:text-white"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Generating Prediction...' : 'Generate Prediction'}
                        </button>

                        <div className="flex-1 overflow-y-scroll p-4 mt-4 rounded bg-white cursor-pointer" onClick={() => setIsModalOpen(true)}>
                            {predictionResult ? (
                                <div className="mb-4 p-4 border border-gray-300 rounded-lg">
                                    <h3 className="text-lg font-semibold text-blue-600">Prediction Result</h3>
                                    <p className="text-gray-700 whitespace-pre-wrap">{predictionResult}</p>
                                </div>
                            ) : (
                                <p className="text-gray-500">{isLoading ? 'Generating prediction...' : 'Enter data and click "Generate Prediction" to get started.'}</p>
                            )}
                        </div>

                        {/* Toggleable Charts */}
                        {areChartsVisible && (
                            <>
                                {/* Line Chart */}
                                <div className="my-8">
                                    <h3 className="text-lg font-semibold text-blue-600 mb-4">Legal Risk Trend Over Time</h3>
                                    <Line data={lineChartData} />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>

            {/* Prediction Result Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
                        <h2 className="text-2xl font-bold mb-4">Prediction Report</h2>
                        <p className="text-gray-700 whitespace-pre-wrap">{predictionResult}</p>
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
