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
    Title as ChartTitle,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartTitle, Tooltip, Legend);

export default function Predictive() {
    const [inputData, setInputData] = useState(''); // User input data for predictions
    const [predictionResult, setPredictionResult] = useState(''); // AI-generated prediction result
    const [isSidebarVisible, setIsSidebarVisible] = useState(true); // State to manage sidebar visibility
    const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility
    const [isLoading, setIsLoading] = useState(false); // State to manage loading state
    const [areChartsVisible, setAreChartsVisible] = useState(true); // Toggle charts visibility
    const [chartData, setChartData] = useState(null); // State to store chart data
    const [chartOptions, setChartOptions] = useState(null); // State to store chart options

    const isChartDataValid = () => {
        return (
            chartData !== null &&
            typeof chartData === 'object' &&
            Array.isArray(chartData.labels) &&
            chartData.labels.length > 0 &&
            Array.isArray(chartData.datasets) &&
            chartData.datasets.length > 0
        );
    };

    const handleGeneratePrediction = async () => {
        if (!inputData.trim()) return;

        setIsLoading(true);

        try {
            // Make an API call to your predictive analytics service
            const response = await fetch('/api/predictive', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ inputData }),
            });

            if (!response.ok) {
                throw new Error('Error generating prediction');
            }

            const data = await response.json();

            if (data.error) {
                console.error('API Error:', data.details);
                setPredictionResult('An error occurred while generating the prediction.');
                setChartData(null);
                setChartOptions(null);
            } else {
                const { predictionResult, chartData, chartOptions } = data;
                setPredictionResult(predictionResult);
                setChartData(chartData);
                setChartOptions(chartOptions);
                setIsModalOpen(true); // Open the modal when prediction is complete
            }
        } catch (error) {
            console.error('Error generating prediction:', error);
            setPredictionResult('An error occurred while generating the prediction.');
            setChartData(null);
            setChartOptions(null);
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

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            {isSidebarVisible && <Sidebar activeLink="/ailawtools/predictive" />}

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col items-center p-4 bg-white">
                <header className="flex items-center justify-between w-full p-4 bg-white">
                    <button
                        onClick={toggleSidebar}
                        className="flex items-center justify-center gap-4 border border-solid border-blue-950 bg-blue-950 text-white px-4 py-2 rounded-md duration-200 hover:bg-white hover:text-blue-950"
                    >
                        {isSidebarVisible ? 'Hide' : 'Show'}
                    </button>
                    <button
                        onClick={toggleChartsVisibility}
                        className="ml-4 border border-solid border-blue-950 bg-white text-blue-950 px-4 py-2 rounded-md duration-200 hover:bg-blue-950 hover:text-white"
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
                            className="border border-solid border-blue-950 bg-white text-blue-950 px-4 py-2 rounded-md duration-200 hover:bg-blue-950 hover:text-white"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Generating Prediction...' : 'Generate Prediction'}
                        </button>

                        <div
                            className="flex-1 overflow-y-scroll p-4 mt-4 rounded bg-white cursor-pointer"
                            onClick={() => setIsModalOpen(true)}
                        >
                            {predictionResult ? (
                                <div className="mb-4 p-4 border border-gray-300 rounded-lg">
                                    <h3 className="text-lg font-semibold text-blue-600">Prediction Result</h3>
                                    <p className="text-gray-700 whitespace-pre-wrap">{predictionResult}</p>
                                </div>
                            ) : (
                                <p className="text-gray-500">
                                    {isLoading
                                        ? 'Generating prediction...'
                                        : 'Enter data and click "Generate Prediction" to get started.'}
                                </p>
                            )}
                        </div>

                        {/* Toggleable Charts */}
                        {areChartsVisible && (
                            isChartDataValid() && chartOptions ? (
                                <>
                                    {/* Line Chart */}
                                    <div className="my-8">
                                        <Line data={chartData} options={chartOptions} />
                                    </div>
                                </>
                            ) : (
                                <p className="text-gray-500">No chart data available.</p>
                            )
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
                            className="mt-4 p-2 border border-solid border-blue-950 bg-blue-950 text-white px-4 py-2 rounded-md duration-200 hover:bg-white hover:text-blue-950"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
