'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Line, Pie, Bar as ChartBar, Radar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title as ChartTitle,
    Tooltip,
    Legend,
    RadialLinearScale
} from 'chart.js';
import { useAuth } from '@/context/AuthContext';
import {
    doc,
    collection,
    getDocs,
    deleteDoc,
    query,
    where,
} from 'firebase/firestore';
import { db } from '@/firebase';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    ChartTitle,
    Tooltip,
    Legend,
    RadialLinearScale
);

export default function ExamInsight() {
    const { currentUser, userDataObj } = useAuth();
    const isDarkMode = userDataObj?.darkMode || false;

    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [isLoadProgressModalOpen, setIsLoadProgressModalOpen] = useState(false);
    const [savedProgresses, setSavedProgresses] = useState([]);
    const [selectedProgresses, setSelectedProgresses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [areChartsVisible, setAreChartsVisible] = useState(true);

    const [correctAnswersCount, setCorrectAnswersCount] = useState({});
    const [incorrectAnswersCount, setIncorrectAnswersCount] = useState({});
    const [questionTypeDistribution, setQuestionTypeDistribution] = useState({});
    const [performanceOverTime, setPerformanceOverTime] = useState({});
    const [recommendedUniversities, setRecommendedUniversities] = useState({});
    const [isRecommending, setIsRecommending] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    const toggleLoadProgressModal = () => {
        setIsLoadProgressModalOpen(!isLoadProgressModalOpen);
    };

    const toggleChartsVisibility = () => {
        setAreChartsVisible(!areChartsVisible);
    };

    const fetchSavedProgresses = async () => {
        if (!currentUser) {
            alert('You need to be logged in to load your progress.');
            return;
        }

        setIsLoading(true);
        try {
            const q = query(collection(db, 'examProgress'), where('userId', '==', currentUser.uid));
            const querySnapshot = await getDocs(q);

            const progresses = [];
            querySnapshot.forEach((doc) => {
                progresses.push({ id: doc.id, ...doc.data() });
            });

            setSavedProgresses(progresses);
        } catch (error) {
            console.error('Error fetching saved progresses:', error);
            alert('An error occurred while fetching saved progresses.');
        } finally {
            setIsLoading(false);
        }
    };

    const openLoadProgressModal = () => {
        fetchSavedProgresses();
        setIsLoadProgressModalOpen(true);
    };

    const closeLoadProgressModal = () => {
        setIsLoadProgressModalOpen(false);
    };

    const handleLoadProgress = (progress) => {
        if (!selectedProgresses.find((p) => p.id === progress.id)) {
            setSelectedProgresses((prev) => [...prev, progress]);
        }
    };

    const handleDeleteProgress = async (id) => {
        if (!currentUser) {
            alert('You need to be logged in to delete your progress.');
            return;
        }

        try {
            await deleteDoc(doc(db, 'examProgress', id));
            fetchSavedProgresses();
            setSelectedProgresses((prev) => prev.filter((p) => p.id !== id));
        } catch (error) {
            console.error('Error deleting progress:', error);
            alert('An error occurred while deleting the progress.');
        }
    };

    useEffect(() => {
        selectedProgresses.forEach((progress) => {
            analyzeProgress(progress);
        });
    }, [selectedProgresses]);

    const analyzeProgress = async (progress) => {
        const answered = progress.answeredQuestions || [];
        let correct = 0;
        let incorrect = 0;
        const typeDistribution = {};
        const performanceTimeline = [];

        answered.forEach((q) => {
            if (q.correct) correct += 1;
            else incorrect += 1;

            const questionType = q.questionType || 'Unknown';
            if (typeDistribution[questionType]) {
                typeDistribution[questionType] += 1;
            } else {
                typeDistribution[questionType] = 1;
            }

            const timestamp = new Date(q.timestamp || progress.timestamp);
            const date = `${timestamp.getMonth() + 1}/${timestamp.getDate()}`;
            performanceTimeline.push({ date, correct: q.correct ? 1 : 0 });
        });

        const progressId = progress.id;
        setCorrectAnswersCount((prev) => ({ ...prev, [progressId]: correct }));
        setIncorrectAnswersCount((prev) => ({ ...prev, [progressId]: incorrect }));

        const performanceMap = {};
        performanceTimeline.forEach((entry) => {
            if (performanceMap[entry.date]) {
                performanceMap[entry.date].total += 1;
                performanceMap[entry.date].correct += entry.correct;
            } else {
                performanceMap[entry.date] = { total: 1, correct: entry.correct };
            }
        });

        const sortedDates = Object.keys(performanceMap).sort(
            (a, b) => new Date(a) - new Date(b)
        );

        const performanceData = sortedDates.map((date) => ({
            date,
            accuracy: ((performanceMap[date].correct / performanceMap[date].total) * 100).toFixed(2),
        }));

        setPerformanceOverTime((prev) => ({ ...prev, [progressId]: performanceData }));
        setQuestionTypeDistribution((prev) => ({ ...prev, [progressId]: typeDistribution }));

        const accuracy = (correct / (correct + incorrect)) * 100;
        recommendLawSchools(progressId, accuracy);
    };

    const recommendLawSchools = async (progressId, accuracy) => {
        setIsRecommending(true);
        try {
            const response = await fetch('/api/recommend-law-schools', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accuracy }),
            });

            if (!response.ok) {
                throw new Error('Failed to get recommendations.');
            }

            const data = await response.json();
            setRecommendedUniversities((prev) => ({ ...prev, [progressId]: data }));
        } catch (error) {
            console.error('Error recommending law schools:', error);
            setRecommendedUniversities((prev) => ({ ...prev, [progressId]: [] }));
        } finally {
            setIsRecommending(false);
        }
    };

    const chartColorsDark = {
        pie: {
            correct: '#00FF7F',
            incorrect: '#FF4500',
            hoverCorrect: '#00FA9A',
            hoverIncorrect: '#FF6347'
        },
        bar: {
            background: 'rgba(0, 255, 255, 0.6)',
            border: 'rgba(0, 255, 255, 1)'
        },
        line: {
            background: 'rgba(255, 0, 255, 0.6)',
            border: 'rgba(255, 0, 255, 1)'
        }
    };

    const chartColorsLight = {
        pie: {
            correct: '#4CAF50',
            incorrect: '#F44336',
            hoverCorrect: '#66BB6A',
            hoverIncorrect: '#E57373'
        },
        bar: {
            background: 'rgba(54, 162, 235, 0.6)',
            border: 'rgba(54, 162, 235, 1)'
        },
        line: {
            background: 'rgba(255, 159, 64, 0.6)',
            border: 'rgba(255, 159, 64, 1)'
        }
    };

    const getPieChartData = (pid) => {
        const correctCount = correctAnswersCount[pid] || 0;
        const incorrectCount = incorrectAnswersCount[pid] || 0;
        const colors = isDarkMode ? chartColorsDark : chartColorsLight;
        return {
            labels: ['Correct', 'Incorrect'],
            datasets: [
                {
                    data: [correctCount, incorrectCount],
                    backgroundColor: [colors.pie.correct, colors.pie.incorrect],
                    hoverBackgroundColor: [colors.pie.hoverCorrect, colors.pie.hoverIncorrect],
                },
            ],
        };
    };

    const getPieChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: isDarkMode ? '#FFFFFF' : '#000000'
                }
            },
        },
    };

    const getBarChartData = (pid) => {
        const dist = questionTypeDistribution[pid] || {};
        const colors = isDarkMode ? chartColorsDark : chartColorsLight;
        return {
            labels: Object.keys(dist),
            datasets: [
                {
                    label: '# of Questions',
                    data: Object.values(dist),
                    backgroundColor: colors.bar.background,
                    borderColor: colors.bar.border,
                    borderWidth: 1,
                },
            ],
        };
    };

    const getBarChartOptions = {
        responsive: true,
        scales: {
            x: {
                ticks: {
                    color: isDarkMode ? '#FFFFFF' : '#000000'
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    color: isDarkMode ? '#FFFFFF' : '#000000'
                },
                grid: {
                    color: isDarkMode ? '#555555' : '#e0e0e0'
                }
            },
        },
        plugins: {
            legend: {
                display: false,
            },
        },
    };

    const getLineChartData = (pid) => {
        const perf = performanceOverTime[pid] || [];
        const colors = isDarkMode ? chartColorsDark : chartColorsLight;
        return {
            labels: Array.isArray(perf) ? perf.map((entry) => entry.date) : [],
            datasets: [
                {
                    label: 'Accuracy (%)',
                    data: Array.isArray(perf) ? perf.map((entry) => entry.accuracy) : [],
                    fill: false,
                    backgroundColor: colors.line.background,
                    borderColor: colors.line.border,
                    tension: 0.1,
                },
            ],
        };
    };

    const getLineChartOptions = {
        responsive: true,
        scales: {
            x: {
                ticks: {
                    color: isDarkMode ? '#FFFFFF' : '#000000'
                }
            },
            y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    color: isDarkMode ? '#FFFFFF' : '#000000'
                },
                grid: {
                    color: isDarkMode ? '#555555' : '#e0e0e0'
                }
            },
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: isDarkMode ? '#FFFFFF' : '#000000'
                }
            },
        },
    };

    const getRadarChartData = (pid) => {
        const dist = questionTypeDistribution[pid] || {};
        const colors = isDarkMode ? chartColorsDark : chartColorsLight;
        return {
            labels: Object.keys(dist),
            datasets: [
                {
                    label: 'Question Types',
                    data: Object.values(dist),
                    backgroundColor: colors.bar.background,
                    borderColor: colors.bar.border,
                    pointBackgroundColor: colors.bar.border,
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: colors.bar.border,
                },
            ],
        };
    };

    const getRadarChartOptions = {
        responsive: true,
        scales: {
            r: {
                angleLines: { color: isDarkMode ? '#FFFFFF' : '#000000' },
                grid: { color: isDarkMode ? '#555555' : '#e0e0e0' },
                pointLabels: { color: isDarkMode ? '#FFFFFF' : '#000000' },
            },
        },
        plugins: {
            legend: {
                labels: {
                    color: isDarkMode ? '#FFFFFF' : '#000000'
                }
            }
        }
    };

    const getDoughnutChartData = (pid) => {
        const correctCount = correctAnswersCount[pid] || 0;
        const incorrectCount = incorrectAnswersCount[pid] || 0;
        const total = correctCount + incorrectCount;
        const correctPercent = total === 0 ? 0 : (correctCount / total) * 100;
        const incorrectPercent = total === 0 ? 0 : (incorrectCount / total) * 100;
        return {
            labels: ['% Correct', '% Incorrect'],
            datasets: [
                {
                    data: [correctPercent, incorrectPercent],
                    backgroundColor: isDarkMode
                        ? ['rgba(0,255,127,0.7)', 'rgba(255,69,0,0.7)']
                        : ['rgba(76,175,80,0.7)', 'rgba(244,67,54,0.7)'],
                    borderWidth: 1,
                },
            ],
        };
    };

    const doughnutOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: isDarkMode ? '#FFFFFF' : '#000000'
                }
            },
        },
    };

    return (
        <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded shadow-sm`}>
            <AnimatePresence>
                {isSidebarVisible && (
                    <>
                        <Sidebar
                            activeLink="/ailawtools/predictive"
                            isSidebarVisible={isSidebarVisible}
                            toggleSidebar={toggleSidebar}
                            isDarkMode={isDarkMode}
                        />

                        <motion.div
                            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={toggleSidebar}
                        />
                    </>
                )}
            </AnimatePresence>

            <main className="flex-1 flex flex-col items-center p-6 overflow-auto">
                <div className="w-full max-w-5xl flex items-center justify-between mb-6">
                    <button
                        onClick={toggleSidebar}
                        className={`${isDarkMode ? 'text-gray-200' : 'text-gray-600'} hover:text-white`}
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
                                    <FaTimes size={24} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="menu-icon"
                                    initial={{ rotate: -90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: 90, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <FaBars size={24} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>

                    <button
                        onClick={openLoadProgressModal}
                        className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
                        aria-label="Load Progress"
                    >
                        Load Progress
                    </button>
                </div>

                <div className={`w-full max-w-5xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md`}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-blue-900'}`}>Exam Insight & Analysis</h2>
                        <button
                            onClick={toggleChartsVisibility}
                            className={`px-4 py-2 border border-solid ${isDarkMode ? 'border-gray-400 bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-white' : 'border-blue-950 bg-white text-blue-950 hover:bg-blue-950 hover:text-white'} rounded-md transition-colors duration-200`}
                        >
                            {areChartsVisible ? 'Hide Charts' : 'Show Charts'}
                        </button>
                    </div>

                    {selectedProgresses.length > 0 ? (
                        areChartsVisible && (
                            <div className="space-y-8">
                                {selectedProgresses.map((prog) => {
                                    const pid = prog.id;
                                    return (
                                        <div key={pid} className={`${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'} p-4 rounded shadow-md transition-colors duration-300`}>
                                            <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-cyan-300' : 'text-blue-700'}`}>
                                                Analysis for: {prog.examConfig.examType} - {prog.examConfig.lawType}
                                            </h3>
                                            <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                <strong>Difficulty:</strong> {prog.examConfig.difficulty}
                                            </p>
                                            <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                <strong>Questions:</strong> {prog.examConfig.flashcardLimit || prog.examConfig.questionLimit}
                                            </p>
                                            <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                <strong>Instant Feedback:</strong> {prog.examConfig.instantFeedback ? 'Enabled' : 'Disabled'}
                                            </p>
                                            <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                <strong>Saved on:</strong> {new Date(prog.timestamp).toLocaleString()}
                                            </p>

                                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-2 rounded shadow-lg">
                                                    <h4 className="text-white text-center mb-2">Performance Overview</h4>
                                                    <Pie data={getPieChartData(pid)} options={getPieChartOptions} />
                                                </div>

                                                <div className="bg-gradient-to-r from-green-500 via-teal-500 to-cyan-500 p-2 rounded shadow-lg">
                                                    <h4 className="text-white text-center mb-2">Question Distribution</h4>
                                                    <ChartBar data={getBarChartData(pid)} options={getBarChartOptions} />
                                                </div>

                                                <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 p-2 rounded shadow-lg">
                                                    <h4 className="text-white text-center mb-2">Performance Over Time</h4>
                                                    <Line data={getLineChartData(pid)} options={getLineChartOptions} />
                                                </div>
                                            </div>

                                            {/* Additional Charts for more insights */}
                                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-gradient-to-r from-indigo-500 via-blue-500 to-green-500 p-2 rounded shadow-lg">
                                                    <h4 className="text-white text-center mb-2">Question Type Radar</h4>
                                                    <Radar data={getRadarChartData(pid)} options={getRadarChartOptions} />
                                                </div>

                                                <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-2 rounded shadow-lg">
                                                    <h4 className="text-white text-center mb-2">Accuracy Doughnut</h4>
                                                    <Doughnut data={getDoughnutChartData(pid)} options={doughnutOptions} />
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <h4 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-cyan-300' : 'text-blue-700'}`}>Recommended Law Schools</h4>
                                                {isRecommending ? (
                                                    <p className={`${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Generating recommendations...</p>
                                                ) : (recommendedUniversities[pid] && recommendedUniversities[pid].length > 0) ? (
                                                    <div className="space-y-4">
                                                        <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                            Based on your performance, the following ABA-accredited law schools in North America are recommended. Each recommendation includes whether it&#39;s more or less likely for you to gain admission, as well as some distinctive benefits that each school offers to aspiring law students:
                                                        </p>
                                                        <ul className="list-disc list-inside mt-2 space-y-2">
                                                            {recommendedUniversities[pid].map((uni, index) => {
                                                                const notesClass = uni.notes.includes('(More Likely)') ? 'text-emerald-400' : 'text-red-400';
                                                                return (
                                                                    <li key={index} className={`${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                                                        <span className="font-semibold">{uni.name}</span> <span className={`text-sm opacity-90 ${notesClass}`}>{uni.notes}</span>
                                                                        <div className="mt-1 ml-4 text-sm opacity-90">
                                                                            {/* Provide more details about each recommended school */}
                                                                            {uni.name.includes('Harvard') && (
                                                                                <p>
                                                                                    Harvard Law School, located in Cambridge, MA, is renowned for its academic rigor and global reputation. Students benefit from extensive legal clinics, top-tier faculty, and unparalleled networking opportunities with alumni who have shaped law and policy worldwide.
                                                                                </p>
                                                                            )}
                                                                            {uni.name.includes('Stanford') && (
                                                                                <p>
                                                                                    Stanford Law School, in Stanford, CA, is known for its interdisciplinary approach, innovative curriculum, and close collaboration with Silicon Valley tech leaders. Its small class sizes and flexible programs foster deep intellectual growth and unique career paths.
                                                                                </p>
                                                                            )}
                                                                            {uni.name.includes('Yale') && (
                                                                                <p>
                                                                                    Yale Law School, in New Haven, CT, emphasizes legal theory, public service, and faculty mentorship. Its intimate environment and selective admissions mean students gain incredible support and form lasting professional relationships.
                                                                                </p>
                                                                            )}
                                                                            {uni.name.includes('Michigan') && (
                                                                                <p>
                                                                                    The University of Michigan Law School offers a strong academic foundation, vibrant student community, and a wide range of joint degree programs. Its respected legal writing curriculum and supportive career services open doors to prestigious clerkships and international opportunities.
                                                                                </p>
                                                                            )}
                                                                            {uni.name.includes('NYU') && (
                                                                                <p>
                                                                                    NYU School of Law, in the heart of New York City, provides unmatched exposure to corporate law firms, public interest organizations, and global institutions. Students benefit from flexible coursework, renowned faculty, and a robust alumni network in top law firms and NGOs.
                                                                                </p>
                                                                            )}
                                                                            {uni.name.includes('Columbia') && (
                                                                                <p>
                                                                                    Columbia Law School, in New York City, stands out for its strong corporate and financial law programs, international law focus, and proximity to global legal markets. Students enjoy seminars led by eminent scholars and practitioners, and unparalleled internship opportunities.
                                                                                </p>
                                                                            )}
                                                                            {uni.name.includes('Arizona State') && (
                                                                                <p>
                                                                                    Arizona State University (ASU) Law stands out for its practical approach, strong connections to the Phoenix legal community, and innovative programs like the Barrow Neurological Institute’s health law partnership. Students enjoy a lower cost of living and strong job placement rates in the Southwest.
                                                                                </p>
                                                                            )}
                                                                            {uni.name.includes('University of Arizona') && (
                                                                                <p>
                                                                                    The University of Arizona Law offers a supportive community, distinguished faculty, and specialized programs in Indigenous law, environmental law, and innovation. Its focus on practical skills and externships helps graduates transition smoothly into the legal workforce.
                                                                                </p>
                                                                            )}
                                                                            {uni.name.includes('Temple') && (
                                                                                <p>
                                                                                    Temple University Law School in Philadelphia is praised for its trial advocacy programs, public interest opportunities, and diverse clinical offerings. Its blend of theoretical and experiential learning helps students build confident courtroom and client-facing skills.
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </li>
                                                                );
                                                            })}
                                                        </ul>
                                                    </div>
                                                ) : (
                                                    <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>No recommendations available.</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    ) : (
                        <div className="text-center">
                            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Please load one or more saved progresses to view insights and analysis.</p>
                        </div>
                    )}
                </div>
            </main>

            <AnimatePresence>
                {isLoadProgressModalOpen && (
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[180]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-lg w-11/12 max-w-3xl shadow-lg overflow-y-auto max-h-screen`}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className={`text-2xl font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Load Saved Progress</h2>
                            {isLoading ? (
                                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Loading...</p>
                            ) : savedProgresses.length === 0 ? (
                                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>No saved progresses found.</p>
                            ) : (
                                <ul className="space-y-4">
                                    {savedProgresses.map((progress) => (
                                        <li key={progress.id} className={`p-4 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded`}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className={`font-semibold ${isDarkMode ? 'text-cyan-300' : 'text-blue-900'}`}>
                                                        Exam Type: {progress.examConfig.examType}
                                                    </p>
                                                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                        Law Type: {progress.examConfig.lawType}
                                                    </p>
                                                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                        Difficulty: {progress.examConfig.difficulty}
                                                    </p>
                                                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                        Number of Questions: {progress.examConfig.flashcardLimit || progress.examConfig.questionLimit}
                                                    </p>
                                                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                        Current Question: {progress.currentQuestionCount}
                                                    </p>
                                                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                        Saved on: {new Date(progress.timestamp).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="flex space-x-2 mt-2">
                                                    <button
                                                        onClick={() => handleLoadProgress(progress)}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors duration-200"
                                                        aria-label="Load Progress"
                                                    >
                                                        Load
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProgress(progress.id)}
                                                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 transition-colors duration-200"
                                                        aria-label="Delete Progress"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <div className="flex justify-end mt-6">
                                <button
                                    onClick={closeLoadProgressModal}
                                    className={`px-6 py-3 ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'} rounded transition-colors duration-200`}
                                    aria-label="Close Load Progress Modal"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
