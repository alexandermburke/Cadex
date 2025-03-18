'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaBars,
  FaTimes,
  FaSearch,
  FaHeart,
  FaRegHeart,
  FaChevronLeft,
  FaChevronRight,
  FaChevronUp,
  FaChevronDown,
  FaTimes as FaClose,
} from 'react-icons/fa';
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
import localDictionary from '@/context/LocalDictionary';

export default function LegalDictionary() {
  const router = useRouter();
  const { currentUser, userDataObj } = useAuth();
  const isDarkMode = userDataObj?.darkMode || false;
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);

  const [activeTab, setActiveTab] = useState('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [dictionaryTerms, setDictionaryTerms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [favoriteTermIds, setFavoriteTermIds] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageDirection, setPageDirection] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(21);
  const [newTermName, setNewTermName] = useState('');
  const [newTermDefinition, setNewTermDefinition] = useState('');
  const [newTermSynonyms, setNewTermSynonyms] = useState('');
  const [newTermReferences, setNewTermReferences] = useState('');
  const [autoGenerate, setAutoGenerate] = useState(false);
  const [showGotoInput, setShowGotoInput] = useState(false);
  const [gotoValue, setGotoValue] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sortBy, setSortBy] = useState('');

  const pageVariants = {
    initial: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    animate: { x: 0, opacity: 1 },
    exit: (direction) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  useEffect(() => {
    const updateItemsPerPage = () => {
      let numCols = 2;
      if (window.innerWidth >= 1024) numCols = 5;
      else if (window.innerWidth >= 640) numCols = 3;
      const offset = 250;
      const availableHeight = window.innerHeight - offset;
      const itemHeight = 220;
      const numRows = Math.floor(availableHeight / itemHeight);
      const newItems = numRows * numCols;
      setItemsPerPage(newItems > 0 ? newItems : 1);
    };
    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  useEffect(() => {
    const fetchDictionary = async () => {
      setIsLoading(true);
      try {
        const colRef = collection(db, 'legalDictionary');
        const snapshot = await getDocs(colRef);
        let firestoreTerms = [];
        snapshot.forEach((docItem) => {
          firestoreTerms.push({ id: docItem.id, ...docItem.data() });
        });
        const combined = [...localDictionary, ...firestoreTerms];
        combined.sort((a, b) =>
          a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        );
        setDictionaryTerms(combined);
      } catch (error) {
        console.error('Error fetching dictionary:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDictionary();
  }, []);

  useEffect(() => {
    if (currentUser && userDataObj?.favoriteDictionaryTerms) {
      setFavoriteTermIds(userDataObj.favoriteDictionaryTerms);
    } else {
      setFavoriteTermIds([]);
    }
  }, [currentUser, userDataObj]);

  const filteredTerms = dictionaryTerms.filter((term) =>
    term.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const termsToDisplay =
    activeTab === 'favorites'
      ? filteredTerms.filter((term) => favoriteTermIds.includes(term.id))
      : filteredTerms;

  const sortedTerms = [...termsToDisplay].sort((a, b) => {
    if (sortBy === 'reverse') {
      return b.name.localeCompare(a.name);
    }
    return a.name.localeCompare(b.name);
  });

  const totalPages = Math.ceil(sortedTerms.length / itemsPerPage);
  const validCurrentPage = Math.min(currentPage, totalPages || 1);
  const paginatedTerms = sortedTerms.slice(
    (validCurrentPage - 1) * itemsPerPage,
    validCurrentPage * itemsPerPage
  );

  function goToPage(num) {
    if (num >= 1 && num <= totalPages) {
      setPageDirection(num > currentPage ? 1 : -1);
      setCurrentPage(num);
    }
  }
  function goToPrevPage() {
    if (currentPage > 1) {
      setPageDirection(-1);
      setCurrentPage(currentPage - 1);
    }
  }
  function goToNextPage() {
    if (currentPage < totalPages) {
      setPageDirection(1);
      setCurrentPage(currentPage + 1);
    }
  }
  function handleGotoSubmit(e) {
    e.preventDefault();
    const page = parseInt(gotoValue, 10);
    if (!isNaN(page)) goToPage(page);
    else {
      setGotoValue('');
      setShowGotoInput(false);
    }
  }

  function openTermModal(term) {
    setSelectedTerm(term);
  }

  function closeTermModal() {
    setSelectedTerm(null);
  }

  const handleToggleFavorite = async (termId) => {
    if (!currentUser) {
      alert('Please log in to favorite terms.');
      return;
    }
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      let updatedFavorites;
      if (favoriteTermIds.includes(termId)) {
        updatedFavorites = favoriteTermIds.filter((id) => id !== termId);
        await updateDoc(userDocRef, {
          favoriteDictionaryTerms: arrayRemove(termId),
        });
      } else {
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

  const handleAddNewTerm = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please log in to add a new dictionary term.');
      return;
    }
    const existingTerm = dictionaryTerms.find(
      (t) => t.name.toLowerCase() === newTermName.trim().toLowerCase()
    );
    if (existingTerm) {
      alert('A term with this name already exists in the dictionary.');
      return;
    }
    let finalDefinition = newTermDefinition.trim();
    if (autoGenerate && !finalDefinition) {
      try {
        setIsLoading(true);
        const res = await fetch('/api/dictionary-autogenerate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ termName: newTermName.trim() }),
        });
        const data = await res.json();
        finalDefinition = data.definition || 'Generated definition placeholder.';
      } catch (err) {
        console.error('Error auto-generating definition:', err);
        alert('Failed to auto-generate the definition. Please try again.');
        setIsLoading(false);
        return;
      } finally {
        setIsLoading(false);
      }
    }
    if (!finalDefinition) {
      alert('Please provide a definition.');
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
      definition: finalDefinition,
      synonyms: synonymsArray,
      references: refsArray,
    };
    try {
      await addDoc(collection(db, 'legalDictionary'), newTermData);
      const updatedList = [
        ...dictionaryTerms,
        { id: `temp-${Date.now()}`, ...newTermData },
      ];
      updatedList.sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );
      setDictionaryTerms(updatedList);
      setNewTermName('');
      setNewTermDefinition('');
      setNewTermSynonyms('');
      setNewTermReferences('');
      alert('Dictionary term added successfully!');
      setActiveTab('browse');
    } catch (error) {
      console.error('Error adding dictionary term:', error);
      alert('Error adding term.');
    }
  };

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

      <main className="flex-1 flex flex-col px-6 relative z-200 h-screen">
        <div
          className={`flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto overflow-x-auto ${
            isDarkMode
              ? 'bg-gradient-to-br from-blue-950 to-slate-900 text-white'
              : 'bg-white text-gray-800'
          } flex flex-col items-center`}
        >
          <div className="flex items-center justify-between w-full">
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

          <div className="w-full max-w-md mx-auto mb-4 flex justify-around">
            <motion.button
              className={`px-4 py-2 font-semibold transition-colors duration-300 ${
                activeTab === 'browse'
                  ? isDarkMode
                    ? 'text-white border-b-2 border-blue-400'
                    : 'text-blue-900 border-b-2 border-blue-900'
                  : isDarkMode
                  ? 'text-gray-400'
                  : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('browse')}
            >
              Browse
            </motion.button>
            <motion.button
              className={`px-4 py-2 font-semibold transition-colors duration-300 ${
                activeTab === 'favorites'
                  ? isDarkMode
                    ? 'text-white border-b-2 border-blue-400'
                    : 'text-blue-900 border-b-2 border-blue-900'
                  : isDarkMode
                  ? 'text-gray-400'
                  : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('favorites')}
            >
              Favorites
            </motion.button>
            <motion.button
              className={`px-4 py-2 font-semibold transition-colors duration-300 ${
                activeTab === 'create'
                  ? isDarkMode
                    ? 'text-white border-b-2 border-blue-400'
                    : 'text-blue-900 border-b-2 border-blue-900'
                  : isDarkMode
                  ? 'text-gray-400'
                  : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('create')}
            >
              Create
            </motion.button>
          </div>

          {(activeTab === 'browse' || activeTab === 'favorites') && (
            <>
              <div className="w-full max-w-md mx-auto mb-6 flex items-center">
                <div className="relative flex-1">
                  <FaSearch
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                      isDarkMode ? 'text-slate-300' : 'text-gray-500'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Search for a term..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className={`w-full pl-10 pr-4 py-3 rounded-full focus:outline-none text-sm transition-colors
                      ${
                        isDarkMode
                          ? 'bg-slate-700 border border-slate-600 text-white placeholder-slate-300'
                          : 'bg-gray-50 border border-gray-200 text-gray-700 placeholder-gray-400'
                      }
                    `}
                  />
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <span className="text-sm font-medium">Sort By</span>
                    {showAdvanced ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    className="mb-6 w-full flex justify-center"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="bg-transparent p-4 rounded-2xl shadow-md flex flex-col space-y-4 w-full max-w-md">
                      <div className="flex flex-col">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className={`p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                        >
                          <option value="">A - Z</option>
                          <option value="reverse">Z - A</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait" custom={pageDirection}>
                <motion.div
                  key={currentPage}
                  custom={pageDirection}
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.5 }}
                  className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto max-h-full pr-2"
                >
                  {paginatedTerms.map((term) => (
                    <motion.div
                      key={term.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3 }}
                      className={`p-4 rounded-xl shadow-lg transition-shadow cursor-pointer group flex flex-col ${
                        isDarkMode
                          ? 'bg-slate-800 bg-opacity-50 border border-slate-700 text-white'
                          : 'bg-white border border-gray-300 text-gray-800'
                      } hover:shadow-xl`}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-md font-bold mb-2 line-clamp-1">
                          {term.name}
                        </h3>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(term.id);
                          }}
                          className="p-1 rounded-full focus:outline-none"
                          aria-label="Favorite"
                        >
                          {favoriteTermIds.includes(term.id) ? (
                            <FaHeart className="text-red-500" size={16} />
                          ) : (
                            <FaRegHeart
                              className={
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }
                              size={16}
                            />
                          )}
                        </motion.button>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {term.definition.length > 100
                          ? term.definition.slice(0, 100) + '...'
                          : term.definition}
                      </p>
                      <div
                        className={`text-xs font-semibold mt-auto self-end transition-colors cursor-pointer ${
                          isDarkMode
                            ? 'text-blue-400 group-hover:text-blue-200'
                            : 'text-blue-600 group-hover:text-blue-400'
                        }`}
                        onClick={() => openTermModal(term)}
                      >
                        View Details
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>

              {sortedTerms.length > itemsPerPage && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <motion.button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    whileHover={{ scale: currentPage !== 1 ? 1.1 : 1 }}
                    whileTap={{ scale: currentPage !== 1 ? 0.9 : 1 }}
                    className={`px-4 py-2 font-semibold transition-colors duration-300 ${
                      currentPage === 1
                        ? isDarkMode
                          ? 'text-gray-400'
                          : 'text-gray-400'
                        : isDarkMode
                        ? 'text-white'
                        : 'text-blue-900'
                    }`}
                  >
                    <FaChevronLeft />
                  </motion.button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(
                    (num) => (
                      <motion.button
                        key={num}
                        onClick={() => goToPage(num)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 py-2 font-semibold transition-colors duration-300 ${
                          num === currentPage
                            ? isDarkMode
                              ? 'text-white border-b-2 border-blue-400'
                              : 'text-blue-900 border-b-2 border-blue-900'
                            : isDarkMode
                            ? 'text-gray-400'
                            : 'text-gray-600'
                        }`}
                      >
                        {num}
                      </motion.button>
                    )
                  )}
                  {totalPages > 5 && (
                    <motion.button
                      onClick={() => setShowGotoInput(!showGotoInput)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`px-2 py-2 font-semibold transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-800'
                      }`}
                    >
                      ...
                    </motion.button>
                  )}
                  {showGotoInput && (
                    <form onSubmit={handleGotoSubmit} className="flex items-center space-x-2">
                      <input
                        type="number"
                        className={`w-16 px-2 py-1 border rounded-md ${
                          isDarkMode
                            ? 'bg-slate-700 text-white border-slate-600'
                            : 'bg-white text-gray-800 border-gray-300'
                        }`}
                        value={gotoValue}
                        onChange={(e) => setGotoValue(e.target.value)}
                        placeholder="Page #"
                      />
                      <button
                        type="submit"
                        className={`px-3 py-1 rounded-md font-semibold transition-colors duration-300 ${
                          isDarkMode
                            ? 'bg-blue-600 hover:bg-blue-500 text-white'
                            : 'bg-blue-950 hover:bg-blue-800 text-white'
                        }`}
                      >
                        Go
                      </button>
                    </form>
                  )}
                  <motion.button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages || totalPages === 0}
                    whileHover={{
                      scale: currentPage === totalPages || totalPages === 0 ? 1 : 1.1,
                    }}
                    whileTap={{
                      scale: currentPage === totalPages || totalPages === 0 ? 1 : 0.9,
                    }}
                    className={`px-4 py-2 font-semibold transition-colors duration-300 ${
                      currentPage === totalPages || totalPages === 0
                        ? isDarkMode
                          ? 'text-gray-400'
                          : 'text-gray-400'
                        : isDarkMode
                        ? 'text-white'
                        : 'text-blue-900'
                    }`}
                  >
                    <FaChevronRight />
                  </motion.button>
                </div>
              )}
            </>
          )}

          {activeTab === 'create' && (
            <div className="w-full flex justify-center">
              <div className="max-w-md w-full">
                <form
                  onSubmit={handleAddNewTerm}
                  className={`p-6 rounded-2xl shadow-md ${
                    isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white' : 'bg-white text-gray-800'
                  }`}
                >
                  <h2 className="text-2xl font-bold mb-4 text-center">
                    Add New Term
                  </h2>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-1">
                      Term Name
                    </label>
                    <input
                      type="text"
                      value={newTermName}
                      onChange={(e) => setNewTermName(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md ${
                        isDarkMode
                          ? 'bg-slate-700 text-white border-slate-600 placeholder-gray-300'
                          : 'bg-white text-gray-800 border-gray-300'
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
                      className={`w-full px-3 py-2 border rounded-md ${
                        isDarkMode
                          ? 'bg-slate-700 text-white border-slate-600 placeholder-gray-300'
                          : 'bg-white text-gray-800 border-gray-300'
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
                      className={`w-full px-3 py-2 border rounded-md ${
                        isDarkMode
                          ? 'bg-slate-700 text-white border-slate-600 placeholder-gray-300'
                          : 'bg-white text-gray-800 border-gray-300'
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
                      className={`w-full px-3 py-2 border rounded-md ${
                        isDarkMode
                          ? 'bg-slate-700 text-white border-slate-600 placeholder-gray-300'
                          : 'bg-white text-gray-800 border-gray-300'
                      }`}
                      placeholder="e.g. Appeal, Detention"
                    />
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <label
                      htmlFor="autoGenerateToggle"
                      className="cursor-pointer font-semibold text-sm"
                    >
                      Auto generate definition
                    </label>
                    <div className="relative inline-block w-14 h-8 select-none transition duration-200 ease-in">
                      <input
                        type="checkbox"
                        name="autoGenerateToggle"
                        id="autoGenerateToggle"
                        checked={autoGenerate}
                        onChange={() => setAutoGenerate(!autoGenerate)}
                        className="toggle-checkbox absolute h-0 w-0 opacity-0"
                      />
                      <label
                        htmlFor="autoGenerateToggle"
                        className="toggle-label block overflow-hidden h-8 rounded-full bg-gray-300 cursor-pointer"
                      ></label>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-2 rounded-md font-semibold transition-colors duration-300 ${
                      isDarkMode
                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                        : 'bg-blue-950 hover:bg-blue-800 text-white'
                    }`}
                  >
                    {isLoading ? 'Creating...' : 'Add Term'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>

      {selectedTerm && (
        <div className="fixed inset-0 z-[190] flex items-center justify-center bg-black bg-opacity-40">
          <motion.div
            className={`relative w-11/12 max-w-5xl p-6 rounded-2xl shadow-2xl ${
              isDarkMode
                ? 'bg-slate-800 text-gray-100'
                : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900'
            }`}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">{selectedTerm.name}</h2>
              <button
                onClick={closeTermModal}
                className={`inline-block px-4 py-2 rounded-full font-semibold text-sm transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-blue-950 hover:bg-blue-800 text-white'
                }`}
              >
                <FaClose />
              </button>
            </div>
            <p className="mb-3">{selectedTerm.definition}</p>
            {selectedTerm.synonyms && selectedTerm.synonyms.length > 0 && (
              <div className="mb-3">
                <strong>Synonyms:</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                  {selectedTerm.synonyms.map((syn) => (
                    <li key={syn}>{syn}</li>
                  ))}
                </ul>
              </div>
            )}
            {selectedTerm.references && selectedTerm.references.length > 0 && (
              <div className="mb-3">
                <strong>References:</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                  {selectedTerm.references.map((ref) => (
                    <li key={ref}>{ref}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
