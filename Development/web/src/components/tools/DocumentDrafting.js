'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import { useRouter } from 'next/navigation';
import { FaBars, FaTimes, FaSearch, FaHighlighter } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// Firebase
import { db } from '@/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  getDocs,
  doc,
  query,
  where,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';

// Auth
import { useAuth } from '@/context/AuthContext';

/**
 * Utility to wrap highlighted substrings in <mark> tags.
 * If multiple highlights appear, it tries to highlight them in the order found.
 * This is a simple approach and won't handle overlapping matches elegantly.
 */
function applyHighlightsToText(text, highlights = []) {
  let result = text;
  // Sort highlights by length (descending), so shorter ones won't break bigger matches
  const sortedHighlights = [...highlights].sort((a, b) => b.length - a.length);

  sortedHighlights.forEach((highlight) => {
    if (!highlight.trim()) return;
    const regex = new RegExp(highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    result = result.replace(regex, (match) => `<mark>${match}</mark>`);
  });
  return result;
}

export default function LectureSummaries() {
  const router = useRouter();
  const { currentUser, userDataObj } = useAuth();
  const isDarkMode = userDataObj?.darkMode || false;

  // Sidebar State
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  // Lecture Summaries States
  const [lectureTitle, setLectureTitle] = useState('');
  const [lectureContent, setLectureContent] = useState('');
  const [lectureCourse, setLectureCourse] = useState('');
  const [lectureKeyTakeaways, setLectureKeyTakeaways] = useState('');
  const [lectureList, setLectureList] = useState([]);

  // Search/Filter States
  const [searchTerm, setSearchTerm] = useState('');

  // Detail/Modal States
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [rawRenderedHTML, setRawRenderedHTML] = useState('');
  const [highlightMode, setHighlightMode] = useState(false);

  // Fetch Summaries on mount if user is logged in
  useEffect(() => {
    if (currentUser) {
      fetchLectureSummaries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const fetchLectureSummaries = async () => {
    if (!currentUser) return;
    try {
      const qRef = query(
        collection(db, 'lectureSummaries'),
        where('userId', '==', currentUser.uid)
      );
      const querySnapshot = await getDocs(qRef);
      const loaded = [];
      querySnapshot.forEach((docSnap) => {
        loaded.push({ id: docSnap.id, ...docSnap.data() });
      });
      setLectureList(loaded);
    } catch (error) {
      console.error('Error fetching lecture summaries:', error);
    }
  };

  /**
   * Adds a new lecture summary to Firestore and local state.
   */
  const handleAddLecture = async () => {
    if (!lectureTitle.trim() || !lectureContent.trim()) return;
    if (!currentUser) {
      alert('You must be logged in to save your lecture summaries.');
      return;
    }

    const newLecture = {
      userId: currentUser.uid,
      title: lectureTitle.trim(),
      content: lectureContent.trim(),
      course: lectureCourse.trim() || 'General',
      keyTakeaways: lectureKeyTakeaways.trim(),
      highlights: [], // We'll store highlight substrings here
      timestamp: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(db, 'lectureSummaries'), newLecture);
      setLectureList([...lectureList, { ...newLecture, id: docRef.id }]);
      // Clear inputs
      setLectureTitle('');
      setLectureContent('');
      setLectureCourse('');
      setLectureKeyTakeaways('');
    } catch (error) {
      console.error('Error saving new lecture:', error);
    }
  };

  /**
   * Opens the detail modal for a selected lecture.
   * We apply highlights using applyHighlightsToText, then store that HTML in state.
   */
  const openLecture = (lecture) => {
    setSelectedLecture(lecture);

    // Render the content with highlights
    const { content, highlights } = lecture;
    const rendered = applyHighlightsToText(content, highlights);
    setRawRenderedHTML(rendered);
    setHighlightMode(false); // reset highlight mode
  };

  /**
   * Closes the detail modal.
   */
  const closeLecture = () => {
    setSelectedLecture(null);
    setHighlightMode(false);
    setRawRenderedHTML('');
  };

  /**
   * Toggles highlight mode on/off
   */
  const toggleHighlightMode = () => {
    setHighlightMode((prev) => !prev);
  };

  /**
   * When in highlight mode, user selects text, we add the substring to the lecture's highlights.
   */
  const handleAddHighlight = async () => {
    if (!selectedLecture) return;
    const selection = window.getSelection().toString().trim();
    if (!selection) {
      alert('No text selected.');
      return;
    }

    // Save highlight in Firestore
    try {
      const updatedHighlights = [...(selectedLecture.highlights || []), selection];
      const lectureRef = doc(db, 'lectureSummaries', selectedLecture.id);
      await updateDoc(lectureRef, { highlights: updatedHighlights });

      // Update local state
      const updatedLecture = { ...selectedLecture, highlights: updatedHighlights };
      setSelectedLecture(updatedLecture);

      // Re-render content with new highlight
      const newRendered = applyHighlightsToText(updatedLecture.content, updatedLecture.highlights);
      setRawRenderedHTML(newRendered);

      // Also update in lectureList
      setLectureList((prevList) =>
        prevList.map((lec) => (lec.id === selectedLecture.id ? updatedLecture : lec))
      );
    } catch (error) {
      console.error('Error updating highlights:', error);
      alert('Error saving highlight to Firestore.');
    }
  };

  /**
   * Deletes a lecture summary from Firestore
   */
  const handleDeleteLecture = async (lectureId) => {
    try {
      await deleteDoc(doc(db, 'lectureSummaries', lectureId));
      setLectureList((prev) => prev.filter((lec) => lec.id !== lectureId));
      if (selectedLecture && selectedLecture.id === lectureId) {
        closeLecture();
      }
    } catch (err) {
      console.error('Error deleting lecture summary:', err);
      alert('Error deleting lecture summary.');
    }
  };

  /**
   * Filter the lectureList by the search term
   */
  const filteredLectures = lectureList.filter((lecture) => {
    const s = searchTerm.toLowerCase();
    if (!s.trim()) return true;
    return (
      lecture.title.toLowerCase().includes(s) ||
      lecture.content.toLowerCase().includes(s) ||
      lecture.course.toLowerCase().includes(s) ||
      lecture.keyTakeaways.toLowerCase().includes(s)
    );
  });

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-100'}`}>
        <AnimatePresence>
              {isSidebarVisible && (
                <>
                  <Sidebar
                    activeLink="/lawtools/lecturesummaries"
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
     

      {/* Main Content */}
      <main
        className={`flex-1 flex flex-col p-4 ${
          isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-black'
        }`}
      >
        {/* Header Bar */}
        <div className="w-full max-w-5xl mx-auto flex items-center justify-between mb-4">
          {/* Toggle Sidebar Button */}
          <button
            onClick={toggleSidebar}
            className={`p-2 rounded focus:outline-none duration-200 ${
              isDarkMode ? 'text-white hover:text-gray-300' : 'text-blue-900 hover:text-blue-700'
            }`}
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

          {/* Search Field */}
          <div
            className={`flex items-center px-2 py-1 border rounded ${
              isDarkMode ? 'bg-slate-700 border-slate-500' : 'bg-white border-gray-300'
            }`}
          >
            <FaSearch className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search Summaries..."
              className={`w-48 sm:w-64 text-sm focus:outline-none ${
                isDarkMode ? 'bg-slate-700 text-white' : 'bg-white text-black'
              }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Input Form for Summaries */}
        <div className="w-full max-w-5xl mx-auto p-4 rounded-md shadow-md mb-4">
          <input
            type="text"
            value={lectureTitle}
            onChange={(e) => setLectureTitle(e.target.value)}
            placeholder="Lecture Title..."
            className={`mb-2 w-full p-2 border rounded focus:outline-none ${
              isDarkMode
                ? 'bg-slate-700 border-slate-600 text-white'
                : 'bg-white border-gray-300 text-black'
            }`}
          />

          <textarea
            value={lectureContent}
            onChange={(e) => setLectureContent(e.target.value)}
            placeholder="Lecture Notes..."
            rows={18}
            className={`mb-2 w-full p-2 border rounded focus:outline-none ${
              isDarkMode
                ? 'bg-slate-700 border-slate-600 text-white'
                : 'bg-white border-gray-300 text-black'
            }`}
          />

          <input
            type="text"
            value={lectureCourse}
            onChange={(e) => setLectureCourse(e.target.value)}
            placeholder="Course/Class name (e.g. 'Criminal Law 101')"
            className={`mb-2 w-full p-2 border rounded focus:outline-none ${
              isDarkMode
                ? 'bg-slate-700 border-slate-600 text-white'
                : 'bg-white border-gray-300 text-black'
            }`}
          />

          <textarea
            value={lectureKeyTakeaways}
            onChange={(e) => setLectureKeyTakeaways(e.target.value)}
            placeholder="Key Takeaways..."
            rows={3}
            className={`mb-2 w-full p-2 border rounded focus:outline-none ${
              isDarkMode
                ? 'bg-slate-700 border-slate-600 text-white'
                : 'bg-white border-gray-300 text-black'
            }`}
          />

          <button
            onClick={handleAddLecture}
            className={`border border-solid border-blue-950 border-x-2 border-y-2 bg-white text-blue-950 px-4 py-2 rounded-md duration-200 hover:bg-blue-950 hover:text-white ${
              isDarkMode ? 'hover:bg-slate-300 hover:text-slate-900' : ''
            } font-semibold`}
          >
            Add Lecture
          </button>
        </div>

        {/* Lecture List */}
        <div
          className={`w-full max-w-5xl mx-auto flex-1 overflow-y-auto p-4 rounded ${
            isDarkMode ? 'bg-slate-700' : 'bg-white'
          }`}
        >
          {filteredLectures.length > 0 ? (
            filteredLectures.map((lecture) => (
              <div
                key={lecture.id}
                className={`mb-4 p-4 border rounded-lg cursor-pointer hover:bg-gray-100 ${
                  isDarkMode ? 'border-slate-600 hover:bg-slate-600 hover:bg-opacity-30' : ''
                }`}
                onClick={() => openLecture(lecture)}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3
                    className={`text-lg font-semibold truncate ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-700'
                    }`}
                  >
                    {lecture.title}
                  </h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      isDarkMode
                        ? 'bg-blue-900 text-white'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {lecture.course || 'General'}
                  </span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-3">
                  {lecture.content.slice(0, 120)}
                  {lecture.content.length > 120 && '...'}
                </p>
                {lecture.keyTakeaways && (
                  <p
                    className={`mt-2 text-xs italic ${
                      isDarkMode ? 'text-blue-300' : 'text-blue-700'
                    }`}
                  >
                    Takeaways: {lecture.keyTakeaways.substring(0, 60)}
                    {lecture.keyTakeaways.length > 60 && '...'}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500">No matching lecture summaries.</p>
          )}
        </div>
      </main>

      {/* Lecture Details Modal */}
      {selectedLecture && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div
            className={`relative ${
              isDarkMode ? 'bg-slate-700 text-white' : 'bg-white text-black'
            } w-11/12 max-w-3xl p-6 rounded-lg shadow-lg`}
          >
            <h2 className="text-2xl font-bold mb-2">{selectedLecture.title}</h2>
            <p className="text-sm text-gray-500 mb-4">
              Course: {selectedLecture.course || 'General'}
            </p>
            <div className="max-h-80 overflow-auto border-b border-gray-300 pb-4 mb-4">
              {/* Render content with highlights */}
              <div
                dangerouslySetInnerHTML={{ __html: rawRenderedHTML }}
                className="whitespace-pre-wrap text-sm"
              />
            </div>
            {selectedLecture.keyTakeaways && (
              <div
                className={`mt-2 p-3 border rounded ${
                  isDarkMode ? 'border-blue-300 bg-blue-900 bg-opacity-20' : 'border-blue-200 bg-blue-50'
                }`}
              >
                <h3 className="font-semibold text-blue-600 mb-1 text-sm">Key Takeaways</h3>
                <p className="text-blue-900 text-sm whitespace-pre-wrap">
                  {selectedLecture.keyTakeaways}
                </p>
              </div>
            )}

            {/* Highlight Mode Toggle + Action */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4">
                <button
                  className={`px-3 py-2 rounded flex items-center space-x-2 ${
                    highlightMode
                      ? 'bg-yellow-200 text-yellow-900'
                      : `${
                          isDarkMode
                            ? 'bg-slate-600 text-white hover:bg-slate-500'
                            : 'bg-gray-200 text-black hover:bg-gray-300'
                        }`
                  }`}
                  onClick={toggleHighlightMode}
                >
                  <FaHighlighter />
                  <span>{highlightMode ? 'Highlight ON' : 'Highlight OFF'}</span>
                </button>
                {highlightMode && (
                  <button
                    className="px-3 py-2 rounded bg-yellow-300 text-yellow-900 hover:bg-yellow-400"
                    onClick={handleAddHighlight}
                  >
                    Highlight Selection
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDeleteLecture(selectedLecture.id)}
                  className={`px-4 py-2 rounded ${
                    isDarkMode
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  Delete
                </button>
                <button
                  onClick={closeLecture}
                  className={`px-4 py-2 rounded border border-blue-900 ${
                    isDarkMode
                      ? 'bg-blue-900 text-white hover:bg-white hover:text-blue-900'
                      : 'bg-blue-950 text-white hover:bg-white hover:text-blue-950'
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
