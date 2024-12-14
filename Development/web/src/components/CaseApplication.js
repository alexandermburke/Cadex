'use client';
import React, { useState, useEffect } from 'react';
import { db } from '@/firebase';
import {
  doc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

export default function ExamPrepProMode() {
  const { currentUser } = useAuth();

  const [examConfig, setExamConfig] = useState({
    examType: 'LSAT',
    difficulty: '',
    lawType: 'General Law',
    questionLimit: 5,
    instantFeedback: false,
    selectedQuestionTypes: [],
    additionalFeatures: [],
    timerLimit: 60,
    analyticsEnabled: true,
    savePresetName: '',
  });

  const [savedConfigs, setSavedConfigs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const difficultyMapping = {
    LSAT: ['Below 150', '150-160', '160-170', '175+'],
    BAR: ['Below Average', 'Average', 'Above Average', 'Expert'],
    MPRE: ['Basic', 'Intermediate', 'Advanced'],
  };

  const lawTypeMapping = {
    LSAT: ['General Law'],
    BAR: [
      'General Law',
      'Criminal Law',
      'Civil Law',
      'Contracts',
      'Torts',
      'Constitutional Law',
      'Evidence',
      'Real Property',
      'Civil Procedure',
      'Business Associations',
      'Family Law',
      'Trusts and Estates',
      'Secured Transactions',
      'Negotiable Instruments',
      'Intellectual Property',
      'Professional Responsibility',
    ],
    MPRE: [
      'Professional Responsibility',
      'Ethics and Legal Responsibilities',
      'Disciplinary Actions',
      'Conflict of Interest',
      'Confidentiality',
      'Client Communication',
      'Fees and Trust Accounts',
      'Advertising and Solicitation',
      'Other Professional Conduct',
    ],
  };

  useEffect(() => {
    const newDifficultyOptions = difficultyMapping[examConfig.examType] || [];
    const newLawTypeOptions = lawTypeMapping[examConfig.examType] || ['General Law'];

    setExamConfig((prevConfig) => ({
      ...prevConfig,
      difficulty: newDifficultyOptions[0] || '',
      lawType: newLawTypeOptions[0] || 'General Law',
    }));
  }, [examConfig.examType]);

  const handleConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    setExamConfig((prevConfig) => ({
      ...prevConfig,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveConfig = async () => {
    if (!currentUser) {
      alert('You need to be logged in to save your configuration.');
      return;
    }

    setIsLoading(true);

    try {
      const configData = {
        userId: currentUser.uid,
        examConfig,
        timestamp: new Date().toISOString(),
      };

      await addDoc(collection(db, 'examConfigs'), configData);
      alert('Configuration saved successfully!');
      fetchSavedConfigs();
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert('An error occurred while saving your configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSavedConfigs = async () => {
    if (!currentUser) return;

    setIsLoading(true);

    try {
      const q = query(collection(db, 'examConfigs'), where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);

      const configs = [];
      querySnapshot.forEach((doc) => {
        configs.push({ id: doc.id, ...doc.data() });
      });

      setSavedConfigs(configs);
    } catch (error) {
      console.error('Error fetching saved configurations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedConfigs();
  }, [currentUser]);

  const handleDeleteConfig = async (id) => {
    if (!currentUser) return;

    setIsLoading(true);

    try {
      await deleteDoc(doc(db, 'examConfigs', id));
      fetchSavedConfigs();
    } catch (error) {
      console.error('Error deleting configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-4">Exam Prep Pro Mode</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Configure Your Exam</h2>
        <form className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">Exam Type:</label>
            <select
              name="examType"
              value={examConfig.examType}
              onChange={handleConfigChange}
              className="w-full p-3 border border-gray-300 rounded"
            >
              <option value="LSAT">LSAT</option>
              <option value="BAR">BAR</option>
              <option value="MPRE">MPRE</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Difficulty:</label>
            <select
              name="difficulty"
              value={examConfig.difficulty}
              onChange={handleConfigChange}
              className="w-full p-3 border border-gray-300 rounded"
            >
              {(difficultyMapping[examConfig.examType] || []).map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Law Type:</label>
            <select
              name="lawType"
              value={examConfig.lawType}
              onChange={handleConfigChange}
              className="w-full p-3 border border-gray-300 rounded"
            >
              {(lawTypeMapping[examConfig.examType] || []).map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Number of Questions:</label>
            <input
              type="number"
              name="questionLimit"
              value={examConfig.questionLimit}
              onChange={(e) =>
                setExamConfig((prevConfig) => ({
                  ...prevConfig,
                  questionLimit: parseInt(e.target.value, 10),
                }))
              }
              min="1"
              max="100"
              className="w-full p-3 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Timer Limit (in minutes):</label>
            <input
              type="number"
              name="timerLimit"
              value={examConfig.timerLimit}
              onChange={(e) =>
                setExamConfig((prevConfig) => ({
                  ...prevConfig,
                  timerLimit: parseInt(e.target.value, 10),
                }))
              }
              min="1"
              max="300"
              className="w-full p-3 border border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="instantFeedback"
              checked={examConfig.instantFeedback}
              onChange={handleConfigChange}
              className="h-5 w-5 text-blue-600"
            />
            <label className="ml-2 text-gray-700">Enable Instant Feedback</label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="analyticsEnabled"
              checked={examConfig.analyticsEnabled}
              onChange={handleConfigChange}
              className="h-5 w-5 text-blue-600"
            />
            <label className="ml-2 text-gray-700">Enable Analytics</label>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Save as Preset:</label>
            <input
              type="text"
              name="savePresetName"
              value={examConfig.savePresetName}
              onChange={handleConfigChange}
              placeholder="Preset Name"
              className="w-full p-3 border border-gray-300 rounded"
            />
          </div>
        </form>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Saved Configurations</h2>
        {isLoading ? (
          <p>Loading...</p>
        ) : savedConfigs.length === 0 ? (
          <p>No saved configurations found.</p>
        ) : (
          <ul className="space-y-4">
            {savedConfigs.map((config) => (
              <li
                key={config.id}
                className="p-4 border border-gray-200 rounded flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{config.examConfig.examType}</p>
                  <p className="text-sm text-gray-600">{config.examConfig.lawType}</p>
                  <p className="text-sm text-gray-600">Questions: {config.examConfig.questionLimit}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setExamConfig(config.examConfig)}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => handleDeleteConfig(config.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex space-x-4">
        <button
          onClick={handleSaveConfig}
          className="px-4 py-2 bg-green-600 text-white rounded"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Configuration'}
        </button>
        <button
          onClick={() => alert('Exam Prep Pro Mode starting soon!')}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Start Exam
        </button>
      </div>
    </div>
  );
}
