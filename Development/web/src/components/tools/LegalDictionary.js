'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaHeart, FaRegHeart, FaPlus, FaSearch } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '../Sidebar';
import { db } from '@/firebase';
import {
  doc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';

// Import your extended local dictionary here:
import localDictionary from '@/context/LocalDictionary';

/**
 * A comprehensive, feature-rich Legal Dictionary component.
 * This component:
 *  - Shows a list of common legal terms, their definitions, synonyms, references, etc.
 *  - Provides a search bar to filter terms.
 *  - Allows logged-in users to "favorite" terms (stored in Firestore).
 *  - Allows an admin (or any user logic) to add new dictionary entries if desired.
 *  - Has a user-friendly UI consistent with the previously shown design.
 *  - Includes dark mode support from user settings.
 *  - Renders a Sidebar for navigation, and supports mobile toggling with animations.
 */

export default function LegalDictionary() {
  const router = useRouter();
  const { currentUser, userDataObj } = useAuth();
  const isDarkMode = userDataObj?.darkMode || false;

  // Sidebar visibility
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);

  // Search bar state
  const [searchQuery, setSearchQuery] = useState('');

  // All dictionary terms (merged from local + Firestore)
  const [dictionaryTerms, setDictionaryTerms] = useState([]);

  // Loading state for Firestore fetch
  const [isLoading, setIsLoading] = useState(false);

  // Favorites from user data (array of term IDs)
  const [favoriteTermIds, setFavoriteTermIds] = useState([]);

  // Track expanded/collapsed definitions
  const [expandedTerm, setExpandedTerm] = useState(null);

  // Check if current user is admin for adding new terms
  const isAdmin = userDataObj?.role === 'admin';

  // Add-new-term form states
  const [newTermName, setNewTermName] = useState('');
  const [newTermDefinition, setNewTermDefinition] = useState('');
  const [newTermSynonyms, setNewTermSynonyms] = useState('');
  const [newTermReferences, setNewTermReferences] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // ============================================================
  // 1. Fetch dictionary data from Firestore & merge with local
  // ============================================================
  useEffect(() => {
    const fetchDictionary = async () => {
      setIsLoading(true);
      try {
        // Fetch Firestore-based dictionary
        const colRef = collection(db, 'legalDictionary');
        const snapshot = await getDocs(colRef);

        let firestoreTerms = [];
        snapshot.forEach((docItem) => {
          firestoreTerms.push({ id: docItem.id, ...docItem.data() });
        });

        // Combine local + Firestore terms
        const combinedTerms = [...localDictionary, ...firestoreTerms];

        // Sort by name for convenience
        combinedTerms.sort((a, b) =>
          a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
        );

        setDictionaryTerms(combinedTerms);
      } catch (error) {
        console.error('Error fetching dictionary from Firestore:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDictionary();
  }, []);

  // ============================================================
  // 2. Fetch user favorites if logged in
  // ============================================================
  useEffect(() => {
    if (currentUser && userDataObj?.favoriteDictionaryTerms) {
      setFavoriteTermIds(userDataObj.favoriteDictionaryTerms);
    } else {
      setFavoriteTermIds([]);
    }
  }, [currentUser, userDataObj]);

  // Filter dictionary terms by search query
  const filteredTerms = dictionaryTerms.filter((term) => {
    const query = searchQuery.toLowerCase();
    return term.name.toLowerCase().includes(query);
  });

  // Toggle expanded term definition
  const toggleExpandTerm = (termId) => {
    if (expandedTerm === termId) {
      setExpandedTerm(null);
    } else {
      setExpandedTerm(termId);
    }
  };

  // ============================================================
  // 3. Favorites: add or remove
  // ============================================================
  const handleToggleFavorite = async (termId) => {
    if (!currentUser) {
      alert('Please log in to favorite terms.');
      return;
    }

    try {
      // Update user doc
      const userDocRef = doc(db, 'users', currentUser.uid);
      let updatedFavorites = [];

      if (favoriteTermIds.includes(termId)) {
        // Remove from favorites
        updatedFavorites = favoriteTermIds.filter((id) => id !== termId);
        await updateDoc(userDocRef, {
          favoriteDictionaryTerms: arrayRemove(termId),
        });
      } else {
        // Add to favorites
        updatedFavorites = [...favoriteTermIds, termId];
        await updateDoc(userDocRef, {
          favoriteDictionaryTerms: arrayUnion(termId),
        });
      }
      setFavoriteTermIds(updatedFavorites);
    } catch (error) {
      console.error('Error updating favorite terms:', error);
      alert('Error updating favorites.');
    }
  };

  // ============================================================
  // 4. Add new dictionary term (Admin-only or any user logic)
  // ============================================================
  const handleAddNewTerm = async () => {
    if (!currentUser) {
      alert('Please log in to add a new dictionary term.');
      return;
    }
    if (!isAdmin) {
      alert('Only admin can add new terms, or adjust logic for others if needed.');
      return;
    }
    if (!newTermName.trim() || !newTermDefinition.trim()) {
      alert('Please provide at least a name and definition.');
      return;
    }

    const synonymsArray = newTermSynonyms
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const refsArray = newTermReferences
      .split(',')
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    const newTermData = {
      name: newTermName.trim(),
      definition: newTermDefinition.trim(),
      synonyms: synonymsArray,
      references: refsArray,
    };

    try {
      // Add new doc to Firestore
      await addDoc(collection(db, 'legalDictionary'), newTermData);

      // Update local array
      const updatedList = [
        ...dictionaryTerms,
        {
          id: `temp-id-${Date.now()}`, // temp ID until next reload
          ...newTermData,
        },
      ];
      updatedList.sort((a, b) =>
        a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
      );
      setDictionaryTerms(updatedList);

      // Reset form
      setNewTermName('');
      setNewTermDefinition('');
      setNewTermSynonyms('');
      setNewTermReferences('');
      setShowAddForm(false);

      alert('Dictionary term added successfully!');
    } catch (error) {
      console.error('Error adding dictionary term:', error);
      alert('Error adding term.');
    }
  };

  // ============================================================
  // 5. Handle user not logged in scenario
  // ============================================================
  if (!currentUser) {
    return (
      <div
        className={`flex items-center justify-center h-screen transition-colors ${
          isDarkMode
            ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white'
            : 'bg-gradient-to-br from-gray-100 to-white text-gray-800'
        }`}
      >
        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl text-center">
          <p className="mb-4 text-lg font-semibold">
            Please log in to access the Legal Dictionary.
          </p>
          <button
            onClick={() => router.push('/login')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-300 ${
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-blue-950 hover:bg-blue-800 text-white'
            }`}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // Main Render
  // ============================================================
  return (
    <div
      className={`relative flex h-screen transition-colors duration-500 ${
        isDarkMode ? 'text-white' : 'text-gray-800'
      }`}
    >
      <AnimatePresence>
        {isSidebarVisible && (
          <>
            <Sidebar
              activeLink="/lawtools/dictionary"
              isSidebarVisible={isSidebarVisible}
              toggleSidebar={toggleSidebar}
              isDarkMode={isDarkMode}
            />
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
            />
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col px-6 relative z-50 h-screen">
        {/* Top Bar with Sidebar Toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={toggleSidebar}
            className="text-blue-900 dark:text-white p-2 rounded transition-colors hover:bg-black/10 focus:outline-none md:hidden"
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
                  key="bars-icon"
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

        {/* Main Container */}
        <div
          className={`flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto overflow-x-auto ${
            isDarkMode
              ? 'bg-gradient-to-br from-slate-900 to-blue-950 text-white'
              : 'bg-white text-gray-800'
          } flex flex-col items-center`}
        >
          <h1 className="text-2xl font-bold mb-4">Legal Dictionary</h1>

          {/* Search bar */}
          <div className="w-full max-w-md mb-6 relative">
            <FaSearch
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                isDarkMode ? 'text-slate-300' : 'text-gray-400'
              }`}
            />
            <input
              type="text"
              placeholder="Search for a term..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-md focus:outline-none text-sm shadow-sm transition-colors ${
                isDarkMode
                  ? 'bg-slate-700 border border-slate-600 text-white'
                  : 'bg-gray-100 border border-gray-300 text-gray-800'
              }`}
            />
          </div>

          {/* Add new term button (admin-only) */}
          {isAdmin && (
            <div className="mb-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddForm(!showAddForm)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-blue-950 hover:bg-blue-800 text-white'
                }`}
              >
                <FaPlus />
                Add New Term
              </motion.button>
            </div>
          )}

          {/* Add new term form */}
          {isAdmin && showAddForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`w-full max-w-xl mb-6 p-4 rounded-xl ${
                isDarkMode
                  ? 'bg-slate-800 border border-slate-700'
                  : 'bg-gray-100 border border-gray-300'
              }`}
            >
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1">
                  Term Name
                </label>
                <input
                  type="text"
                  value={newTermName}
                  onChange={(e) => setNewTermName(e.target.value)}
                  className={`w-full p-2 rounded-md text-sm focus:outline-none transition-colors ${
                    isDarkMode
                      ? 'bg-slate-700 border border-slate-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-800'
                  }`}
                  placeholder="e.g. Habeas Corpus"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1">
                  Definition
                </label>
                <textarea
                  rows="3"
                  value={newTermDefinition}
                  onChange={(e) => setNewTermDefinition(e.target.value)}
                  className={`w-full p-2 rounded-md text-sm focus:outline-none transition-colors ${
                    isDarkMode
                      ? 'bg-slate-700 border border-slate-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-800'
                  }`}
                  placeholder="Enter a clear definition..."
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1">
                  Synonyms (comma-separated)
                </label>
                <input
                  type="text"
                  value={newTermSynonyms}
                  onChange={(e) => setNewTermSynonyms(e.target.value)}
                  className={`w-full p-2 rounded-md text-sm focus:outline-none transition-colors ${
                    isDarkMode
                      ? 'bg-slate-700 border border-slate-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-800'
                  }`}
                  placeholder="e.g. Great Writ, Writ of Liberty"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1">
                  References (comma-separated)
                </label>
                <input
                  type="text"
                  value={newTermReferences}
                  onChange={(e) => setNewTermReferences(e.target.value)}
                  className={`w-full p-2 rounded-md text-sm focus:outline-none transition-colors ${
                    isDarkMode
                      ? 'bg-slate-700 border border-slate-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-800'
                  }`}
                  placeholder="e.g. Appeal, Detention"
                />
              </div>

              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddNewTerm}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-300 ${
                    isDarkMode
                      ? 'bg-green-600 hover:bg-green-500 text-white'
                      : 'bg-green-700 hover:bg-green-600 text-white'
                  }`}
                >
                  Save
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Loading indicator for dictionary fetch */}
          {isLoading ? (
            <div className="text-sm text-gray-500 mt-4">
              Loading dictionary...
            </div>
          ) : (
            <>
              {/* Terms list */}
              <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto max-h-full pr-2">
                <AnimatePresence>
                  {filteredTerms.map((term) => {
                    const isFavorited = favoriteTermIds.includes(term.id);
                    const isExpanded = expandedTerm === term.id;

                    return (
                      <motion.div
                        key={term.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                        className={`p-4 rounded-xl shadow-lg transition-shadow cursor-pointer group ${
                          isDarkMode
                            ? 'bg-slate-800 border border-slate-700 text-white'
                            : 'bg-white border border-gray-300 text-gray-800'
                        } hover:shadow-xl flex flex-col`}
                      >
                        <div className="flex justify-between items-center">
                          <h3
                            className="text-md font-bold mb-2"
                            onClick={() => toggleExpandTerm(term.id)}
                          >
                            {term.name}
                          </h3>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleToggleFavorite(term.id)}
                            className="p-1 rounded-full focus:outline-none"
                            aria-label="Favorite"
                          >
                            {isFavorited ? (
                              <FaHeart className="text-red-500" />
                            ) : (
                              <FaRegHeart
                                className={`${
                                  isDarkMode
                                    ? 'text-gray-400'
                                    : 'text-gray-600'
                                }`}
                              />
                            )}
                          </motion.button>
                        </div>

                        {/* If not expanded, show truncated definition */}
                        {!isExpanded && (
                          <p className="text-sm text-gray-500 mb-2">
                            {term.definition.length > 100
                              ? term.definition.slice(0, 100) + '...'
                              : term.definition}
                          </p>
                        )}

                        {/* Expand/collapse */}
                        {isExpanded && (
                          <motion.div
                            className="overflow-hidden text-sm"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <p className="mb-3">{term.definition}</p>

                            {/* Synonyms */}
                            {term.synonyms && term.synonyms.length > 0 && (
                              <div className="mb-3">
                                <strong>Synonyms:</strong>
                                <ul className="list-disc list-inside ml-4 mt-1">
                                  {term.synonyms.map((syn) => (
                                    <li key={syn}>{syn}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* References */}
                            {term.references && term.references.length > 0 && (
                              <div className="mb-3">
                                <strong>References:</strong>
                                <ul className="list-disc list-inside ml-4 mt-1">
                                  {term.references.map((ref) => (
                                    <li key={ref}>{ref}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </motion.div>
                        )}

                        {/* Expand/Collapse label */}
                        <div
                          onClick={() => toggleExpandTerm(term.id)}
                          className={`text-xs font-semibold mt-auto self-end transition-colors cursor-pointer ${
                            isDarkMode
                              ? 'text-blue-400 group-hover:text-blue-200'
                              : 'text-blue-600 group-hover:text-blue-400'
                          }`}
                        >
                          {isExpanded ? 'Hide' : 'View'} Details
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
              {/* If no results */}
              {filteredTerms.length === 0 && (
                <div className="text-sm text-gray-500 mt-4">
                  No terms match your query.
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
