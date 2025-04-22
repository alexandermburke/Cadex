'use client';
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Sidebar from '../Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaBars,
  FaTimes,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaArrowRight,
  FaHeart,
  FaRegHeart,
  FaSync,
  FaChevronUp,
  FaChevronDown,
  FaTimes as FaClose
} from 'react-icons/fa';
import { useRouter, useSearchParams } from 'next/navigation';
import { db } from '@/firebase';
import { collection, getDocs, doc, getDoc, updateDoc, addDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function AllBriefs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, userDataObj } = useAuth();
  const plan = userDataObj?.billing?.plan?.toLowerCase() || 'free';
  const isFree = plan === 'free';
  const isPro = plan === 'basic';
  const isExpert = plan === 'expert';
  const isDarkMode = userDataObj?.darkMode || false;

  const [isSidebarVisible, setIsSidebarVisible] = useState(window.innerWidth >= 768);
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);

  const [capCases, setCapCases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCase, setSelectedCase] = useState(null);
  const [caseBrief, setCaseBrief] = useState(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');
  const [filterDate, setFilterDate] = useState('');
  const [filterJurisdiction, setFilterJurisdiction] = useState('');
  const [bulletpointView, setBulletpointView] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(18);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sortBy, setSortBy] = useState('');
  const [showGotoInput, setShowGotoInput] = useState(false);
  const [gotoValue, setGotoValue] = useState('');
  const [newBriefTitle, setNewBriefTitle] = useState('');
  const [newBriefDate, setNewBriefDate] = useState('');
  const [newBriefCitation, setNewBriefCitation] = useState('');
  const [verificationReply, setVerificationReply] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  const generateCaseNumber = () => {
    const num = Math.floor(Math.random() * 1000000);
    return num.toString().padStart(6, '0');
  };

  // Meta description for SEO
  const metaDescription = `Browse ${capCases.length} case briefs on CadexLaw — expert‐written summaries including rule of law, facts, issues, holdings, reasoning & dissents.`;

  // Fetch all cases
  useEffect(() => {
    const fetchCapCases = async () => {
      setIsLoading(true);
      try {
        const snap = await getDocs(collection(db, 'capCases'));
        const loaded = [];
        snap.forEach((docSnap) => loaded.push({ id: docSnap.id, ...docSnap.data() }));
        setCapCases(loaded);
      } catch (err) {
        console.error('Error fetching capCases:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCapCases();
  }, [currentUser]);

  // Initialize favorites
  useEffect(() => {
    if (userDataObj?.favorites) {
      setFavorites(userDataObj.favorites);
    }
  }, [userDataObj]);

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": capCases.map((c, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "url": `https://www.cadexlaw.com/casebriefs/summaries/${c.id}`,
      "item": {
        "@type": "LegalCase",
        "name": c.title,
        "url": `https://www.cadexlaw.com/casebriefs/summaries/${c.id}`,
        "datePublished": c.decisionDate || "",
        "citation": c.citation || "",
        "jurisdiction": c.jurisdiction || ""
      }
    }))
  };

  // Update citation for a case
  const updateCitationForCase = async (c) => {
    try {
      const payload = { title: c.title, date: c.decisionDate || '', citation: c.citation };
      const res = await fetch('/api/casebrief-citation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        console.error('Citation API error:', (await res.json()).error);
        return;
      }
      const data = await res.json();
      await updateDoc(doc(db, 'capCases', c.id), { citation: data.citation });
    } catch (error) {
      console.error('Error updating citation:', error);
    }
  };

  // Toggle favorite
  const toggleFavorite = async (caseId) => {
    if (!currentUser) {
      const updated = favorites.includes(caseId)
        ? favorites.filter((id) => id !== caseId)
        : [...favorites, caseId];
      setFavorites(updated);
      return;
    }
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const updated = favorites.includes(caseId)
        ? favorites.filter((id) => id !== caseId)
        : [...favorites, caseId];
      setFavorites(updated);
      await updateDoc(userDocRef, { favorites: updated });
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  // Share case URL
  const shareCase = async () => {
    if (!selectedCase) return;
    const shareData = {
      title: selectedCase.title,
      text: 'Check out this case brief on CadexLaw',
      url: window.location.href,
    };
    if (navigator.share) {
      await navigator.share(shareData).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('URL copied to clipboard');
    }
  };

  // Adjust items per page
  useEffect(() => {
    const updateItems = () => {
      let cols = window.innerWidth >= 1024 ? 5 : window.innerWidth >= 640 ? 3 : 2;
      const rows = Math.floor((window.innerHeight - 150) / 220);
      setItemsPerPage(Math.max((rows * cols) - 3, 1));
    };
    updateItems();
    window.addEventListener('resize', updateItems);
    return () => window.removeEventListener('resize', updateItems);
  }, []);

  // Filter, sort, paginate
  const filteredCases = capCases.filter((c) => {
    const s = searchTerm.toLowerCase();
    return (
      c.title.toLowerCase().includes(s) ||
      c.jurisdiction?.toLowerCase().includes(s) ||
      c.volume?.toLowerCase().includes(s) ||
      c.decisionDate?.toLowerCase().includes(s) ||
      c.content?.toLowerCase().includes(s)
    ) && (!filterDate || c.decisionDate?.includes(filterDate))
      && (!filterJurisdiction || c.jurisdiction?.toLowerCase().includes(filterJurisdiction.toLowerCase()));
  });
  const displayCases = activeTab === 'favorites'
    ? filteredCases.filter((c) => favorites.includes(c.id))
    : filteredCases;
  const sortedCases = [...displayCases].sort((a, b) => {
    if (sortBy === 'citation') return (a.citation || '').localeCompare(b.citation || '');
    if (sortBy === 'date') return (a.decisionDate || '').localeCompare(b.decisionDate || '');
    if (sortBy === 'jurisdiction') return (a.jurisdiction || '').localeCompare(b.jurisdiction || '');
    return 0;
  });
  const totalPages = Math.ceil(sortedCases.length / itemsPerPage);
  const page = Math.min(currentPage, totalPages || 1);
  const paginatedCases = sortedCases.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const paginationNumbers = () => {
    let start = 1, end = totalPages;
    if (totalPages > 5) {
      if (page <= 3) end = 5;
      else if (page + 2 >= totalPages) start = totalPages - 4;
      else { start = page - 2; end = page + 2; }
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const goToPage = (n) => { if (n >= 1 && n <= totalPages) { setCurrentPage(n); setShowGotoInput(false); setGotoValue(''); } };
  const goPrev = () => page > 1 && setCurrentPage(page - 1);
  const goNext = () => page < totalPages && setCurrentPage(page + 1);

  // Open a case
  const openCase = async (c) => {
    setSelectedCase(c);
    setCaseBrief(null);
    setIsVerified(false);
    setIsFavorited(favorites.includes(c.id));
    updateCitationForCase(c);

    if (c.briefSummary) {
      setCaseBrief(c.briefSummary);
      if (c.briefSummary.verified) setIsVerified(true);
      else reRunSummary(c);
    } else {
      setIsSummaryLoading(true);
      try {
        const res = await fetch('/api/casebrief-summary', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body:JSON.stringify({ title:c.title, date:c.decisionDate, citation:c.citation, docId:c.id })
        });
        const data = await res.json();
        await updateDoc(doc(db,'capCases',c.id), { briefSummary: { ...data, verified:false } });
        setCaseBrief(data);
        const vres = await fetch('/api/casebrief-verification',{
          method:'POST', headers:{'Content-Type':'application/json'},
          body:JSON.stringify({ briefSummary:data, caseTitle:c.title, decisionDate:c.decisionDate, citation:c.citation })
        });
        const vdata = await vres.json();
        if (vdata.verified) {
          await updateDoc(doc(db,'capCases',c.id), { 'briefSummary.verified': true });
          setIsVerified(true);
        }
      } catch (e) {
        console.error(e);
        setCaseBrief({ error: 'Error fetching summary.' });
      } finally {
        setIsSummaryLoading(false);
      }
    }
  };

  const reRunSummary = async (c) => {
    setIsSummaryLoading(true);
    try {
      const res = await fetch('/api/casebrief-summary', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ title:c.title, date:c.decisionDate, citation:c.citation, docId:c.id })
      });
      const data = await res.json();
      await updateDoc(doc(db,'capCases',c.id), { briefSummary: { ...data, verified:false } });
      setCaseBrief(data);
      const vres = await fetch('/api/casebrief-verification',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ briefSummary:data, caseTitle:c.title, decisionDate:c.decisionDate, citation:c.citation })
      });
      const vdata = await vres.json();
      if (vdata.verified) {
        await updateDoc(doc(db,'capCases',c.id), { 'briefSummary.verified': true });
        setIsVerified(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const closeCase = () => {
    setSelectedCase(null);
    setCaseBrief(null);
    setIsVerified(false);
    setIsFavorited(false);
  };

  const handleBulletpointToggle = (e) => setBulletpointView(e.target.checked);

  // Create new brief
  const createNewCaseBrief = async (e) => {
    e.preventDefault();
    setCreateError('');
    setVerificationReply('');
    if (!newBriefTitle.trim() || !newBriefDate.trim() || !newBriefCitation.trim()) {
      setCreateError('Please fill in all fields.');
      return;
    }
    setCreateLoading(true);
    try {
      const payload = { title:newBriefTitle, date:newBriefDate, citation:newBriefCitation.trim()||'N/A' };
      const summaryRes = await fetch('/api/casebrief-summary',{
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)
      });
      if (!summaryRes.ok) throw new Error((await summaryRes.json()).error||'Summary generation failed.');
      let summaryData = await summaryRes.json();
      const verifyRes = await fetch('/api/casebrief-verification',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ briefSummary:summaryData, caseTitle:newBriefTitle, decisionDate:newBriefDate, citation:newBriefCitation })
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.verified) setVerificationReply(verifyData.explanation||'Verification failed.');

      const newCase = {
        title: summaryData.corrections?.title || newBriefTitle,
        decisionDate: summaryData.corrections?.date || newBriefDate,
        volume: '',
        content: '',
        citation: summaryData.corrections?.citation || newBriefCitation,
        briefSummary:{ ...summaryData, verified:false },
        caseNumber: generateCaseNumber(),
      };
      const docRef = await addDoc(collection(db,'capCases'), newCase);
      setCapCases((prev)=>[...prev,{ id: docRef.id, ...newCase }]);
      setNewBriefTitle('');
      setNewBriefDate('');
      setNewBriefCitation('');
      setActiveTab('browse');
      router.push(`/casebriefs/summaries/${docRef.id}`);
    } catch (error) {
      console.error('Error creating new case brief:', error);
      setCreateError('Error creating new case brief. Please check inputs.');
    } finally {
      setCreateLoading(false);
    }
  };

  // Listen for caseId param
  useEffect(() => {
    const caseIdParam = searchParams.get('caseId');
    if (caseIdParam && capCases.length) {
      const found = capCases.find((c) => c.id === caseIdParam);
      if (found) openCase(found);
    }
  }, [searchParams, capCases]);

  return (
    <>
      <Head>
        <title>All Case Briefs – CadexLaw</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content="case brief, legal summary, IRAC, law student aid, landmark cases" />
        <meta name="author" content="CadexLaw" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.cadexlaw.com/casebriefs/allbriefs" />

        {/* Open Graph */}
        <meta property="og:title" content="All Case Briefs – CadexLaw" />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content="https://www.cadexlaw.com/casebriefs/allbriefs" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="CadexLaw" />
        <meta property="og:image" content="https://www.cadexlaw.com/images/all-briefs-og.jpg" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="All Case Briefs – CadexLaw" />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content="https://www.cadexlaw.com/images/all-briefs-og.jpg" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <div className="relative flex h-screen transition-colors duration-500 bg-transparent">
        <AnimatePresence>
          {isSidebarVisible && (
            <>
              <Sidebar
                activeLink="/casebriefs/allbriefs"
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
        <main className="flex-1 flex flex-col px-2 relative z-50 h-screen">
          <div
            className={`flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto overflow-x-auto ${
              isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white' : 'bg-white text-gray-800'
            } flex flex-col items-center`}
          >
            {/* Tab Buttons */}
            <div className="w-full max-w-md mx-auto mb-4 flex justify-around">
              {['browse','favorites','create'].map((tab) => (
                <motion.button
                  key={tab}
                  className={`px-4 py-2 font-semibold transition-colors duration-300 ${
                    activeTab === tab
                      ? isDarkMode
                        ? 'text-white border-b-2 border-blue-400'
                        : 'text-blue-900 border-b-2 border-blue-900'
                      : isDarkMode
                      ? 'text-gray-400'
                      : 'text-gray-600'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </motion.button>
              ))}
            </div>

            {/* Search + Sort */}
            {(activeTab === 'browse' || activeTab === 'favorites') && (
              <>
                <div className="mb-6 w-full flex justify-center items-center gap-4">
                  <div
                    className={`relative flex items-center ${
                      isDarkMode ? 'bg-slate-700' : 'bg-gray-50'
                    } rounded-full px-3 py-2 w-full max-w-md`}
                  >
                    <FaSearch className="text-gray-700 dark:text-white/70 mr-2" />
                    <input
                      type="text"
                      placeholder="Search Cases..."
                      className={`bg-transparent placeholder-gray-500 dark:placeholder-white/70 text-gray-500 dark:text-white focus:outline-none text-sm flex-1`}
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <span className="text-sm font-medium">Sort By</span>
                    {showAdvanced ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
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
                      <div className="bg-transparent p-4 rounded-2xl shadow-md flex flex-row gap-4 w-full max-w-md justify-center">
                        {['','citation','date','jurisdiction'].map((key) => (
                          <button
                            key={key}
                            onClick={() => setSortBy(key)}
                            className={`px-3 py-1 rounded-md transition-colors duration-300 ${
                              sortBy === key
                                ? isDarkMode
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-blue-900 text-white'
                                : isDarkMode
                                ? 'bg-slate-700 text-white'
                                : 'bg-white text-gray-800 border border-gray-300'
                            }`}
                          >
                            {key === '' ? 'Default' : key.charAt(0).toUpperCase() + key.slice(1)}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            {/* Create Tab */}
            {activeTab === 'create' ? (
              <div className="w-full flex justify-center">
                <div className="max-w-md w-full">
                  <form
                    onSubmit={createNewCaseBrief}
                    className={`${
                      isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white' : 'bg-white text-gray-800'
                    } p-6 rounded-2xl shadow-md`}
                  >
                    <h2 className="text-2xl font-bold mb-4 text-center">Create New Case Brief</h2>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-1">Title</label>
                      <input
                        type="text"
                        value={newBriefTitle}
                        onChange={(e) => setNewBriefTitle(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md ${
                          isDarkMode
                            ? 'bg-slate-700 text-white border-slate-600 placeholder-gray-300'
                            : 'bg-white text-gray-800 border-gray-300'
                        }`}
                        placeholder="Enter case title"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-1">Year</label>
                      <input
                        type="text"
                        value={newBriefDate}
                        onChange={(e) => setNewBriefDate(e.target.value)}
                        maxLength="4"
                        pattern="\d{4}"
                        title="Enter a 4-digit year"
                        className={`w-full px-3 py-2 border rounded-md ${
                          isDarkMode
                            ? 'bg-slate-700 text-white border-slate-600 placeholder-gray-300'
                            : 'bg-white text-gray-800 border-gray-300'
                        }`}
                        placeholder="Enter 4-digit year"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-1">Citation</label>
                      <input
                        type="text"
                        value={newBriefCitation}
                        onChange={(e) => setNewBriefCitation(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md ${
                          isDarkMode
                            ? 'bg-slate-700 text-white border-slate-600 placeholder-gray-300'
                            : 'bg-white text-gray-800 border-gray-300'
                        }`}
                        placeholder="Enter case citation"
                      />
                    </div>
                    {createError && (
                      <div className="mb-4 text-red-500 text-sm font-medium">{createError}</div>
                    )}
                    {verificationReply && (
                      <div className="mb-4 p-2 bg-white text-red-500 font-mono text-sm rounded">
                        {verificationReply}
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={createLoading}
                      className={`w-full py-2 rounded-md font-semibold transition-colors duration-300 ${
                        isDarkMode
                          ? 'bg-blue-600 hover:bg-blue-500 text-white'
                          : 'bg-blue-950 hover:bg-blue-800 text-white'
                      }`}
                    >
                      {createLoading ? 'Creating...' : 'Create Case Brief'}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <>
                {isLoading ? (
                  <div className="w-full h-1 bg-blue-500 animate-pulse" />
                ) : (
                  <>
                    {/* Case Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full relative">
                      {paginatedCases.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => openCase(c)}
                          className={`p-4 rounded-xl shadow-lg transition-transform transform hover:scale-105 cursor-pointer group flex flex-col ${
                            isDarkMode
                              ? 'bg-slate-800 bg-opacity-50 border border-slate-700 text-white'
                              : 'bg-white border border-gray-300 text-gray-800'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-md font-semibold line-clamp-1">{c.title}</h3>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`text-xs py-1 px-2 rounded-full ${
                                  isDarkMode ? 'bg-blue-200 text-blue-900' : 'bg-blue-900 text-white'
                                }`}
                              >
                                {c.jurisdiction || 'Unknown'}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(c.id);
                                }}
                                aria-label="Toggle Favorite"
                              >
                                {favorites.includes(c.id) ? (
                                  <FaHeart className="text-red-500" size={16} />
                                ) : (
                                  <FaRegHeart className="text-gray-400" size={16} />
                                )}
                              </button>
                            </div>
                          </div>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Date: {c.decisionDate || 'N/A'}
                          </p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Citation: {c.citation || 'N/A'}
                          </p>
                          <p
                            className={`text-xs mt-2 line-clamp-2 italic ${
                              isDarkMode ? 'text-gray-500' : 'text-gray-600'
                            }`}
                          >
                            {c.briefSummary?.facts?.slice(0, 100) || 'no description available'}...
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    <div className="mt-6 flex items-center justify-center gap-2">
                      <motion.button
                        onClick={goPrev}
                        disabled={page === 1}
                        whileHover={{ scale: page !== 1 ? 1.1 : 1 }}
                        whileTap={{ scale: page !== 1 ? 0.9 : 1 }}
                        className={`px-4 py-2 font-semibold transition-colors duration-300 ${
                          page === 1
                            ? 'text-gray-400'
                            : isDarkMode
                            ? 'text-white'
                            : 'text-blue-900'
                        }`}
                      >
                        <FaChevronLeft />
                      </motion.button>
                      {paginationNumbers().map((num) => (
                        <motion.button
                          key={num}
                          onClick={() => goToPage(num)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-4 py-2 font-semibold transition-colors duration-300 ${
                            num === page
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
                      ))}
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
                        <form onSubmit={(e) => { e.preventDefault(); const n = parseInt(gotoValue,10); if(!isNaN(n)) goToPage(n); else { setGotoValue(''); setShowGotoInput(false); } }} className="flex items-center space-x-2">
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
                        onClick={goNext}
                        disabled={page === totalPages || totalPages === 0}
                        whileHover={{ scale: page === totalPages || totalPages === 0 ? 1 : 1.1 }}
                        whileTap={{ scale: page === totalPages || totalPages === 0 ? 1 : 0.9 }}
                        className={`px-4 py-2 font-semibold transition-colors duration-300 ${
                          page === totalPages || totalPages === 0
                            ? 'text-gray-400'
                            : isDarkMode
                            ? 'text-white'
                            : 'text-blue-900'
                        }`}
                      >
                        <FaChevronRight />
                      </motion.button>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Case Detail Modal */}
            {selectedCase && (
             <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-[99]">
                <motion.div
                  className={`relative w-11/12 max-w-full sm:max-w-5xl p-6 rounded-2xl shadow-2xl ${
                    isDarkMode
                      ? 'bg-slate-800 text-gray-100'
                      : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900'
                  } overflow-y-auto max-h-[90vh]`}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.7, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedCase.title}</h2>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {selectedCase.jurisdiction || 'Unknown'} | Volume: {selectedCase.volume || 'N/A'} | Date: {selectedCase.decisionDate || 'N/A'}
                      </p>
                      <p className={`text-sm mt-1 font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        Citation: <span className="font-normal">{selectedCase.citation || 'N/A'}</span>
                      </p>
                      <div className="flex items-center text-xs mt-1">
                        <span className="verified-by text-gray-400 text-sm">Verified by LExAPI</span>
                        {isVerified ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="ml-2 flex items-center justify-center w-6 h-6 border-2 border-emerald-500 rounded-full"
                          >
                            <span className="text-emerald-500 font-bold text-lg">✓</span>
                          </motion.div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="ml-2 flex items-center justify-center w-6 h-6 border-2 border-red-500 rounded-full"
                          >
                            <span className="text-red-500 font-bold text-lg">✕</span>
                          </motion.div>
                        )}
                        {(isPro || isExpert) && (
                          <motion.button
                            onClick={() => reRunSummary(selectedCase)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="ml-4"
                            aria-label="Re-generate Brief"
                          >
                            <FaSync size={20} className="text-gray-400" />
                          </motion.button>
                        )}
                        <motion.button
                          onClick={() => toggleFavorite(selectedCase.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="ml-4"
                          aria-label="Toggle Favorite"
                        >
                          {favorites.includes(selectedCase.id) ? (
                            <FaHeart size={20} className="text-red-500" />
                          ) : (
                            <FaRegHeart size={20} className="text-gray-400" />
                          )}
                        </motion.button>
                      </div>
                    </div>
                    <button
                      onClick={closeCase}
                      className={`inline-block px-4 py-2 rounded-full font-semibold text-sm transition-colors duration-300 ${
                        isDarkMode
                          ? 'bg-blue-600 gradientShadowHoverBlue text-white'
                          : 'bg-blue-950 gradientShadowHoverWhite text-white'
                      }`}
                      aria-label="Close Brief Modal"
                    >
                      <FaClose />
                    </button>
                  </div>

                  <div
                    className={`max-h-60 overflow-auto border-b pb-3 mb-4 ${
                      isDarkMode ? 'border-gray-600 text-gray-200' : 'border-gray-300 text-gray-800'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap text-sm">
                      {selectedCase.content?.trim() || 'No detailed content available for this case.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <label className="font-semibold text-sm">
                      {bulletpointView ? 'Bullet Points' : 'Classic View'}
                    </label>
                    <div className="relative inline-block w-14 h-8 select-none transition duration-200 ease-in">
                      <input
                        type="checkbox"
                        id="bulletPointsToggle"
                        checked={bulletpointView}
                        onChange={handleBulletpointToggle}
                        className="toggle-checkbox absolute h-0 w-0 opacity-0"
                      />
                      <label
                        htmlFor="bulletPointsToggle"
                        className="toggle-label block overflow-hidden h-8 rounded-full bg-gray-300 cursor-pointer"
                      />
                    </div>
                  </div>

                  {isSummaryLoading ? (
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="relative w-16 h-16">
                        <svg className="transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-gray-300"
                            strokeWidth="4"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-blue-500 animate-progress"
                            strokeWidth="4"
                            strokeLinecap="round"
                            fill="none"
                            strokeDasharray="25, 100"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                      </div>
                      <div className="text-sm text-gray-400">We are verifying the Case Brief, please wait...</div>
                    </div>
                  ) : caseBrief ? (
                    caseBrief.error ? (
                      <div className="text-sm text-red-500">{caseBrief.error}</div>
                    ) : (
                      <div
                        className={`p-3 rounded-md ${
                          isDarkMode
                            ? 'bg-slate-700 border border-blue-600'
                            : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 border border-blue-200'
                        }`}
                      >
                        <h3 className={`font-bold mb-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                          Case Brief
                        </h3>
                        {['ruleOfLaw','facts','issue','holding','reasoning','dissent'].map((section) => (
                          <div className="mb-3" key={section}>
                            <strong>{section === 'dissent' ? 'Dissent' : section.charAt(0).toUpperCase()+section.slice(1).replace(/([A-Z])/g, ' $1') }:</strong>
                            {bulletpointView ? (
                              <ul className="list-disc list-inside text-sm mt-1">
                                <li>{caseBrief[section] || 'Not provided.'}</li>
                              </ul>
                            ) : (
                              <p className="text-sm mt-1">{caseBrief[section] || 'Not provided.'}</p>
                            )}
                          </div>
                        ))}
                        <div className="text-xs italic text-gray-400">
                          Still in development, information may not be fully accurate.
                        </div>
                        <motion.a
                          whileHover={{ scale: 1.0, x: 1 }}
                          whileTap={{ scale: 1 }}
                          href={`/casebriefs/summaries/${selectedCase.id}`}
                          className={`mt-3 inline-flex items-center gap-1 text-sm font-semibold rounded px-2 py-1 gradientShadowHoverWhite ${
                            isDarkMode
                              ? 'bg-blue-100 border border-blue-600 text-blue-600'
                              : 'bg-blue-100 border border-blue-600 text-blue-600'
                          }`}
                        >
                          See full Case Brief <FaArrowRight />
                        </motion.a>
                      </div>
                    )
                  ) : (
                    <div className="text-sm text-gray-400">No summary available.</div>
                  )}
                </motion.div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

export { AllBriefs };
