'use client'
import React, { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Sidebar from '../Sidebar'
import { useParams, useRouter } from 'next/navigation'
import {
  FaBars,
  FaTimes,
  FaHeart,
  FaRegHeart,
  FaSync,
  FaShareAlt,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '@/firebase'
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  limit,
  getDocs
} from 'firebase/firestore'
import { useAuth } from '@/context/AuthContext'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

const simplifyText = (text = '', maxLength = 400) => {
  if (!text) return 'Not provided.'
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

const parseYear = (dateString) => {
  const parsed = new Date(dateString)
  return isNaN(parsed) ? '____' : parsed.getFullYear()
}

const getCitation = (caseObj, style, page = '___') => {
  if (!caseObj) return 'Citation not available.'
  const year = parseYear(caseObj.decisionDate)
  const title = caseObj.title || 'N/A'
  const volume = caseObj.volume || '___'
  const reporter = 'U.S.'
  const pageNumber = caseObj.page || page
  switch (style) {
    case 'bluebook':
      return `${title}, ${volume} ${reporter} ${pageNumber} (${year}).`
    case 'ieee':
      return `[${title}, ${volume} ${reporter} ${pageNumber} (${year})]`
    case 'apa':
      return `${title}, ${volume} ${reporter} ${pageNumber} (${year}).`
    case 'mla':
      return `${title}. ${volume} ${reporter} ${pageNumber}. ${year}.`
    case 'chicago':
      return `${title}, ${volume} ${reporter} ${pageNumber} (${year}).`
    case 'ama':
      return `${title}. ${volume} ${reporter} ${pageNumber} (${year}).`
    default:
      return `${title}, ${volume} ${reporter} ${pageNumber} (${year}).`
  }
}

const saveAsPDF = async (pdfRef, title) => {
  if (!pdfRef.current) return
  try {
    const originalFontSize = pdfRef.current.style.fontSize
    pdfRef.current.style.fontSize = '24px'
    const canvas = await html2canvas(pdfRef.current, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`${title || 'case-brief'}.pdf`)
    pdfRef.current.style.fontSize = originalFontSize
  } catch {}
}

function getInitialViewMode() {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('caseBriefViewMode')
    if (stored && ['classic', 'chatbot', 'simplified'].includes(stored)) {
      return stored
    }
  }
  return 'classic'
}

const MAX_FREE_VIEWS = 3

export default function CaseSummaries() {
  const router = useRouter()
  const { caseId } = useParams()
  const { currentUser, userDataObj } = useAuth()
  const isLoggedIn = !!currentUser
  const plan = userDataObj?.billing?.plan?.toLowerCase() || 'free'
  const isPro = plan === 'basic'
  const isExpert = plan === 'expert'
  const isPaidUser = isPro || isExpert
  const isDarkMode = userDataObj?.darkMode || false

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const [isSidebarVisible, setIsSidebarVisible] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  )
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible)

  const [capCase, setCapCase] = useState(null)
  const [caseBrief, setCaseBrief] = useState(null)
  const [isSummaryLoading, setIsSummaryLoading] = useState(false)
  const [reRunCount, setReRunCount] = useState(0)
  const [isVerified, setIsVerified] = useState(false)
  const pdfRef = useRef(null)

  const viewModes = [
    { label: 'Classic',   value: 'classic' },
    { label: 'LexBot',    value: 'chatbot' },
    { label: 'Simple',    value: 'simplified' }
  ]
  const [viewMode, setViewMode] = useState('classic')
  useEffect(() => {
    const initial = getInitialViewMode()
    setViewMode(initial)
  }, [])
  useEffect(() => {
    localStorage.setItem('caseBriefViewMode', viewMode)
  }, [viewMode])
  const selectedIndex = viewModes.findIndex(m => m.value === viewMode)

  const [relatedCases, setRelatedCases] = useState([])
  const [favorites, setFavorites] = useState([])
  const [isFavorited, setIsFavorited] = useState(false)
  const [favoriteCases, setFavoriteCases] = useState([])
  const [selectedFavorite, setSelectedFavorite] = useState(null)
  const [citationStyle, setCitationStyle] = useState('bluebook')
  const [copySuccess, setCopySuccess] = useState(false)
  const [isHowToOpen, setIsHowToOpen] = useState(false)

  const [viewCount, setViewCount] = useState(0)

  useEffect(() => {
    const count = parseInt(localStorage.getItem('caseBriefViewCount') || '0', 10)
    setViewCount(count)
  }, [])

  useEffect(() => {
    if (!caseId || isPaidUser) return
    const count = parseInt(localStorage.getItem('caseBriefViewCount') || '0', 10)
    const newCount = count + 1
    localStorage.setItem('caseBriefViewCount', newCount)
    setViewCount(newCount)
  }, [caseId, isPaidUser])

  useEffect(() => {
    if (caseId) localStorage.setItem('lastCaseBriefId', caseId)
  }, [caseId])

  useEffect(() => {
    if (!caseId && typeof window !== 'undefined') {
      const last = localStorage.getItem('lastCaseBriefId')
      if (last) router.replace(`/casebriefs/summaries/${last}`)
    }
  }, [caseId, router])

  const pageTitle = capCase
    ? `${capCase.title} Case Brief Summary – 20,000+ Case Briefs with Summaries | CadexLaw`
    : 'CadexLaw Case Brief Summary – 20,000+ Case Briefs with Summaries'
  const pageDescription = capCase
    ? `Read our ${capCase.title} case brief summary—rule of law, facts, issue spotting, holding, reasoning & opinions.`
    : 'Explore thousands of case brief summaries, IRAC outlines, and in-depth legal analysis on CadexLaw.'
  const pageUrl = `https://www.cadexlaw.com/casebriefs/summaries/${caseId || ''}`

  const limitReached = !isPaidUser && viewCount >= MAX_FREE_VIEWS
  const enableAccessControls = limitReached

  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatContainerRef = useRef(null)

  useEffect(() => {
    if (viewMode !== 'chatbot') return
    if (chatMessages.length === 0) {
      setChatMessages([{
        sender: 'bot',
        text: `Hi! Ask me anything about ${capCase?.title || 'this case'}.`
      }])
    }
  }, [viewMode, capCase])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatMessages])

  const handleChatSend = async () => {
    if (!chatInput.trim()) return
    const userText = chatInput.trim()
    setChatInput('')
    setChatMessages(msgs => [...msgs, { sender: 'user', text: userText }])
    setChatLoading(true)
    try {
      const res = await fetch('/api/Chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userText, caseName: capCase?.title || '' })
      })
      const data = await res.json()
      const reply = data.answer || 'Sorry, no answer available.'
      setChatMessages(msgs => [...msgs, { sender: 'bot', text: reply }])
    } catch {
      setChatMessages(msgs => [...msgs, { sender: 'bot', text: 'Error retrieving answer.' }])
    } finally {
      setChatLoading(false)
    }
  }

  const renderFactsContent = (factsText) => {
    if (!factsText) return <p className="text-base mt-2">Not provided.</p>
    const str = String(factsText).trim()
    if (viewMode === 'simplified') {
      return <p className={`${mounted && enableAccessControls && !isLoggedIn ? 'blur-sm' : ''} text-base mt-2`}>{simplifyText(str)}</p>
    }
    let items = str.match(/(\d+[\.\)]\s[\s\S]*?)(?=\d+[\.\)]\s|$)/g) || []
    if (items.length < 2) {
      const sents = (str.match(/[^\.!\?]+[\.!\?]+/g) || []).map(s => s.trim())
      if (sents.length > 1) items = sents.map((s,i) => `${i+1}. ${s}`)
    }
    if (items.length < 2) {
      const parts = str.split(',').map(p => p.trim()).filter(Boolean)
      if (parts.length > 1) items = parts.map((p,i) => `${i+1}. ${p}`)
    }
    return (
      <ul className={`list-disc list-inside text-base mt-2 ${mounted && enableAccessControls && !isLoggedIn ? 'blur-sm' : ''}`}>
        {items.map((it,i) => {
          const txt = it.replace(/^\d+[\.\)]\s*/, '')
          return <li key={i}>{txt}</li>
        })}
      </ul>
    )
  }

  const toggleFavoriteCase = async () => {
    if (!capCase) return
    if (!isLoggedIn) {
      alert('Please log in to favorite cases.')
      return
    }
    try {
      const userDocRef = doc(db, 'users', currentUser.uid)
      let updated = favorites.includes(capCase.id)
        ? favorites.filter(id => id !== capCase.id)
        : [...favorites, capCase.id]
      setIsFavorited(!favorites.includes(capCase.id))
      setFavorites(updated)
      await updateDoc(userDocRef, { favorites: updated })
    } catch {
      alert('Error toggling favorite.')
    }
  }

  useEffect(() => {
    if (caseId && caseBrief) {
      localStorage.setItem(`caseBrief_${caseId}`, JSON.stringify(caseBrief))
    }
  }, [caseBrief, caseId])

  useEffect(() => {
    if (caseId) {
      const saved = localStorage.getItem(`caseBrief_${caseId}`)
      if (saved) {
        const sb = JSON.parse(saved)
        setCaseBrief(sb)
        setIsVerified(sb.verified || false)
      }
    }
  }, [caseId])

  useEffect(() => {
    if (!userDataObj) return
    if (Array.isArray(userDataObj.favorites)) {
      const fetchFavs = async () => {
        const arr = []
        for (const favId of userDataObj.favorites) {
          try {
            const snap = await getDoc(doc(db, 'capCases', favId))
            if (snap.exists()) arr.push({ id: snap.id, ...snap.data() })
          } catch {}
        }
        setFavoriteCases(arr)
      }
      fetchFavs()
    }
  }, [userDataObj])

  useEffect(() => {
    const sel = localStorage.getItem('selectedFavoriteForSummary')
    if (sel) {
      const f = favoriteCases.find(c => c.id === sel)
      if (f) setSelectedFavorite(f)
    }
  }, [favoriteCases])

  useEffect(() => {
    if (selectedFavorite) {
      ;(async () => {
        try {
          const snap = await getDoc(doc(db, 'capCases', selectedFavorite.id))
          if (!snap.exists()) return setCaseBrief({ error: 'Not found.' })
          const c = { id: snap.id, ...snap.data() }
          setCapCase(c)
          if (viewMode === 'simplified') {
            setCaseBrief(c.briefSummary || { error: 'None.' })
            setIsVerified(c.briefSummary?.verified || false)
          } else {
            setCaseBrief(c.detailedSummary || { error: 'None.' })
            setIsVerified(c.detailedSummary?.verified || false)
          }
        } catch {
          setCaseBrief({ error: 'Error fetching.' })
        }
      })()
    }
  }, [selectedFavorite, viewMode])

  const shareCase = () => {
    if (!capCase) return
    const url = `${window.location.origin}/casebriefs/summaries/${capCase.id}`
    const data = { title: capCase.title, text: 'Check this case brief', url }
    if (navigator.share) navigator.share(data).catch(() => {})
    else {
      navigator.clipboard.writeText(url)
      alert('URL copied')
    }
  }

  const reGenerateSummary = () => {
    if (!capCase) return
    if (viewMode === 'simplified') getCapCaseBriefSummary(capCase)
    else getCapCaseSummary(capCase)
  }

  const getCapCaseSummary = async (c) => {
    setIsSummaryLoading(true)
    setCaseBrief(null)
    try {
      const res = await fetch('/api/casebrief-detailed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: c.title, citation: c.citation, detailed: true })
      })
      const data = await res.json()
      setCaseBrief(data)
      setIsVerified(false)
      await updateDoc(doc(db, 'capCases', c.id), {
        detailedSummary: { ...data, verified: false }
      })
      await verifyDetailedSummary(data, c)
    } catch {
      setCaseBrief({ error: 'Error fetching summary.' })
    } finally {
      setIsSummaryLoading(false)
    }
  }

  const getCapCaseBriefSummary = async (c) => {
    setIsSummaryLoading(true)
    setCaseBrief(null)
    try {
      const res = await fetch('/api/casebrief-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: c.title, citation: c.citation, date: c.decisionDate || '' })
      })
      const data = await res.json()
      setCaseBrief(data)
      setIsVerified(false)
      await updateDoc(doc(db, 'capCases', c.id), {
        briefSummary: { ...data, verified: false }
      })
      await verifyBriefSummary(data, c)
    } catch {
      setCaseBrief({ error: 'Error fetching summary.' })
    } finally {
      setIsSummaryLoading(false)
    }
  }

  const verifyDetailedSummary = async (data, c) => {
    try {
      const res = await fetch('/api/casebrief-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          briefSummary: data,
          caseTitle: c.title,
          decisionDate: c.decisionDate,
          jurisdiction: c.jurisdiction
        })
      })
      const vb = await res.json()
      if (vb.verified) {
        setIsVerified(true)
        await updateDoc(doc(db, 'capCases', c.id), { 'detailedSummary.verified': true })
      } else if (reRunCount < 5) {
        setReRunCount(r => r + 1)
        await getCapCaseSummary(c)
      } else {
        setCaseBrief({ error: 'Verification failed.' })
      }
    } catch {
      setIsVerified(false)
    }
  }

  const verifyBriefSummary = async (data, c) => {
    try {
      const res = await fetch('/api/casebrief-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          briefSummary: data,
          caseTitle: c.title,
          decisionDate: c.decisionDate,
          jurisdiction: c.jurisdiction
        })
      })
      const vb = await res.json()
      if (vb.verified) {
        setIsVerified(true)
        await updateDoc(doc(db, 'capCases', c.id), { 'briefSummary.verified': true })
      } else if (reRunCount < 5) {
        setReRunCount(r => r + 1)
        await getCapCaseBriefSummary(c)
      } else {
        setCaseBrief({ error: 'Verification failed.' })
      }
    } catch {
      setIsVerified(false)
    }
  }

  const saveAsPDFHandler = () => saveAsPDF(pdfRef, capCase?.title)
  const copyCitationToClipboard = () => {
    const text = getCitation(capCase, citationStyle, '113')
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    })
  }

  useEffect(() => {
    if (!caseId) return
    ;(async () => {
      const snap = await getDoc(doc(db, 'capCases', caseId))
      if (!snap.exists()) return
      const c = { id: snap.id, ...snap.data() }
      setCapCase(c)
      if (viewMode === 'simplified') {
        if (c.briefSummary) {
          setCaseBrief(c.briefSummary)
          setIsVerified(c.briefSummary.verified || false)
        } else await getCapCaseBriefSummary(c)
      } else {
        if (c.detailedSummary) {
          setCaseBrief(c.detailedSummary)
          setIsVerified(c.detailedSummary.verified || false)
        } else await getCapCaseSummary(c)
      }
    })()
  }, [caseId, viewMode])

  useEffect(() => {
    if (!capCase) return
    ;(async () => {
      const q = query(
        collection(db, 'capCases'),
        where('jurisdiction', '==', capCase.jurisdiction || ''),
        where('__name__', '!=', capCase.id),
        limit(3)
      )
      const snap = await getDocs(q)
      const arr = []
      snap.forEach(d => arr.push({ id: d.id, ...d.data() }))
      setRelatedCases(arr)
    })()
  }, [capCase])

  const headingByMode = {
    classic:    'Case Brief Summary',
    chatbot:    'Case Brief Summary',
    simplified: 'Case Brief Summary'
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="Content-Language" content="en" />
        <meta name="author" content="CadexLaw" />
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="case briefs, IRAC outlines, legal analysis, law student, case summary examples" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="CadexLaw" />
        <meta property="og:image" content="https://www.cadexlaw.com/images/case-brief-og.jpg" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://www.cadexlaw.com/images/case-brief-og.jpg" />
      </Head>

      <div
        ref={pdfRef}
        className={`relative flex h-screen transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
      >
        <AnimatePresence>
          {isSidebarVisible && (
            <>
              <Sidebar
                activeLink="/casebriefs/summaries"
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
          <div className="flex items-center justify-between">
            <button
              onClick={toggleSidebar}
              className="md:hidden self-start m-2 p-2 bg-white rounded-full shadow"
              aria-label={isSidebarVisible ? 'Close menu' : 'Open menu'}
            >
              {isSidebarVisible ? <FaTimes /> : <FaBars />}
            </button>
          </div>

          <div className={`relative flex-1 w-full h-full rounded-2xl shadow-xl p-6 overflow-y-auto overflow-x-auto ${isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white' : 'bg-white text-gray-800'} flex flex-col items-center`}>
            {limitReached && (
              <div className="absolute inset-0 z-40 flex flex-col items-center justify-center space-y-6 bg-white/60 dark:bg-slate-800/90 backdrop-blur-sm">
                <p className="text-lg font-semibold text-center px-4">You have reached the limit of free case briefs.</p>
                <button
                  onClick={() => router.push('/register')}
                  className="group relative h-12 w-full sm:w-56 overflow-hidden rounded bg-gradient-to-r from-blue-600 to-blue-800 text-white text-sm sm:text-base shadow transition-all duration-300 flex items-center justify-center gradientShadowHoverBlue"
                >
                  <span className="font-semibold">Register for unlimited access</span>
                </button>
              </div>
            )}

            <h1 className="text-2xl font-bold mb-8">{headingByMode[viewMode]}</h1>

            <div className={`p-6 rounded-xl mb-6 ${isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white border border-slate-700' : 'bg-gray-100 text-gray-800 border border-gray-300'}`} ref={pdfRef}>
              <h2 className={`text-xl font-semibold ${enableAccessControls && !isLoggedIn ? 'blur-sm' : ''}`}>{capCase?.title || 'No Title'}</h2>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} ${enableAccessControls && !isLoggedIn ? 'blur-sm' : ''}`}>
                {capCase?.jurisdiction || 'Unknown'} | Volume: {capCase?.volume || 'N/A'} | Date: {capCase?.decisionDate || 'N/A'}
              </p>
              <p className={`text-sm mt-1 font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} ${enableAccessControls && !isLoggedIn ? 'blur-sm' : ''}`}>
                Citation: <span className="font-normal">{capCase?.citation || 'N/A'}</span>
              </p>
              <div className={`flex items-center text-xs mt-1 ${enableAccessControls && !isLoggedIn ? 'blur-sm' : ''}`}>
                <span className="text-gray-400">Verified by LExAPI 3.0</span>
                {isVerified ? (
                  <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="ml-2 flex items-center justify-center w-6 h-6 border-2 border-emerald-500 rounded-full">
                    <span className="text-emerald-500 font-bold text-lg">✓</span>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="ml-2 flex items-center justify-center w-6 h-6 border-2 border-red-500 rounded-full">
                    <span className="text-red-500 font-bold text-lg">✕</span>
                  </motion.div>
                )}
                {(isPro || isExpert) && (
                  <motion.button onClick={reGenerateSummary} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="ml-4" aria-label="Re-generate Summary">
                    <FaSync size={16} className="text-gray-400" />
                  </motion.button>
                )}
                <motion.button onClick={shareCase} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="ml-4" aria-label="Share Case">
                  <FaShareAlt size={16} className="text-gray-400" />
                </motion.button>
                {isLoggedIn && (
                  <motion.button onClick={toggleFavoriteCase} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="ml-4" aria-label="Toggle Favorite">
                    {isFavorited ? <FaHeart size={16} className="text-red-500" /> : <FaRegHeart size={16} className="text-gray-400" />}
                  </motion.button>
                )}
              </div>
            </div>

            <div className="relative flex items-center justify-center mb-6">
              <div className={`relative flex items-center rounded-full p-1 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`} style={{ width: '240px' }}>
                <motion.div
                  className={`absolute top-0 left-0 h-full rounded-full ${isDarkMode ? 'bg-slate-600' : 'bg-white'} shadow`}
                  style={{ width: '33.33%' }}
                  initial={false}
                  animate={{ x: `${selectedIndex * 100}%` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
                {viewModes.map((mode, i) => (
                  <button
                    key={mode.value}
                    onClick={() => setViewMode(mode.value)}
                    className={`relative z-10 flex-1 text-xs sm:text-sm font-semibold py-1 transition-colors ${
                      selectedIndex === i
                        ? isDarkMode
                          ? 'text-blue-300'
                          : 'text-blue-600'
                        : isDarkMode
                          ? 'text-gray-200'
                          : 'text-gray-700'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full relative">
              {viewMode === 'chatbot' ? (
                <div className={`mx-auto w-full max-w-2xl flex-1 rounded-2xl flex flex-col justify-between overflow-hidden mt-10 ${isDarkMode ? 'bg-slate-800 bg-opacity-60 border border-slate-700' : 'bg-white border border-gray-300'} shadow-lg`}>
                  <div
                    ref={chatContainerRef}
                    className={`flex-1 overflow-y-auto p-6 space-y-4 ${isDarkMode ? '' : 'bg-gray-50'} scrollbar-thin scrollbar-thumb-gray-400`}
                  >
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`w-2/3 px-4 py-3 rounded-lg break-words ${
                          msg.sender === 'user'
                            ? `self-end ${isDarkMode ? 'bg-green-600 text-white' : 'bg-green-200 text-gray-900'}`
                            : `self-start ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'}`
                        }`}
                      >
                        {msg.text}
                      </div>
                    ))}
                    {chatLoading && (
                      <div
                        className={`self-start px-4 py-3 rounded-lg animate-pulse ${
                          isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        ...
                      </div>
                    )}
                  </div>
                  <div className={`p-4 flex ${isDarkMode ? 'bg-slate-700 border-t border-slate-600' : 'bg-gray-100 border-t border-gray-200'}`}>
                    <input
                      type="text"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleChatSend()}
                      className={`flex-1 border rounded-l-full px-4 py-2 focus:outline-none ${
                        isDarkMode
                          ? 'border-gray-500 bg-gray-700 text-white placeholder-gray-400'
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder={`Ask about ${capCase?.title || 'this case'}...`}
                    />
                    <button
                      onClick={handleChatSend}
                      disabled={chatLoading}
                      className={`px-4 py-2 rounded-r-full focus:outline-none text-white ${
                        isDarkMode
                          ? 'bg-blue-500 hover:bg-blue-400'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      Send
                    </button>
                  </div>
                </div>
              ) : isSummaryLoading ? (
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
                  <div className="text-sm text-gray-400">
                    We are verifying the Case Brief, this may take up to 1 minute...
                  </div>
                </div>
              ) : caseBrief ? (
                <div className={`p-6 rounded-xl relative z-10 ${enableAccessControls && !isLoggedIn ? 'blur-sm' : ''}`}>
                  <div className="flex items-center justify-between mb-4">
                    <strong className="block text-lg">Rule of Law:</strong>
                  </div>
                  <p className="text-base mt-2">{caseBrief.ruleOfLaw}</p>
                  <div className="flex items-center justify-between mb-4 mt-6">
                    <strong className="block text-lg">Facts:</strong>
                  </div>
                  {caseBrief.facts
                    ? renderFactsContent(caseBrief.facts)
                    : <p className={`text-base mt-2 ${mounted && enableAccessControls && !isLoggedIn ? 'blur-sm' : ''}`}>Not provided.</p>
                  }
                  <div className="flex items-center justify-between mb-4 mt-6">
                    <strong className="block text-lg">Issue:</strong>
                  </div>
                  <p className={`text-base mt-2 ${mounted && enableAccessControls && !isLoggedIn ? 'blur-sm' : ''}`}>{caseBrief.issue}</p>
                  {(caseBrief.holding || caseBrief.reasoning || caseBrief.concurrence || caseBrief.dissent) && (
                    <div className="mb-4 mt-6">
                      <strong className="block text-lg mb-2">Opinions:</strong>
                      <div className="ml-4 space-y-2">
                        {caseBrief.holding && (
                          <div>
                            <strong className="block text-base">Majority:</strong>
                            <div className="flex items-center justify-between mt-2">
                              <p>{caseBrief.holding}</p>
                            </div>
                          </div>
                        )}
                        {caseBrief.reasoning && (
                          <div className="mt-2">
                            <strong className="block text-base">Reasoning:</strong>
                            <div className="flex items-center justify-between">
                              <p className="mt-2">{caseBrief.reasoning}</p>
                            </div>
                          </div>
                        )}
                        {caseBrief.concurrence && (
                          <div className="mt-2">
                            <strong className="block text-base">Concurrence:</strong>
                            <div className="flex items-center justify-between">
                              <p className="mt-2">{caseBrief.concurrence}</p>
                            </div>
                          </div>
                        )}
                        {caseBrief.dissent && (
                          <div className="mt-2">
                            <strong className="block text-base">Dissent:</strong>
                            <div className="flex items-center justify-between">
                              <p className="mt-2">{caseBrief.dissent}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-4 mt-6">
                    <strong className="block text-lg text-blue-600">Analysis:</strong>
                  </div>
                  <p className="text-base mt-2">{caseBrief.analysis}</p>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center">
                  <p className="text-sm text-gray-400 mb-2">View All Briefs to Select a Case Brief.</p>
                  <select
                    className="p-2 rounded-md border border-gray-300 max-w-md"
                    onChange={e => {
                      const f = favoriteCases.find(c => c.id === e.target.value)
                      setSelectedFavorite(f)
                      localStorage.setItem('selectedFavoriteForSummary', e.target.value)
                    }}
                    value={selectedFavorite?.id || ''}
                  >
                    <option value="">Select a favorite case</option>
                    {favoriteCases.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.title} ({f.jurisdiction || 'Unknown'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="w-full mt-8">
              <div className="flex justify-center mb-4">
                <button
                  onClick={() => setIsHowToOpen(!isHowToOpen)}
                  className="flex items-center px-5 py-2 bg-indigo-600 text-white text-base font-medium rounded-full shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  <span className="mr-2">How to Write a Case Brief</span>
                  {isHowToOpen ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}
                </button>
              </div>
              {isHowToOpen && (
                <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-slate-800 bg-opacity-50 border border-slate-700' : 'bg-gray-100 border border-gray-300'}`}>
                  <ol className="list-decimal list-inside space-y-4">
                    <li>
                      <strong>Case Citation:</strong>
                      <p className="text-base mt-1">Provide the full case citation including:</p>
                      <ul className="list-disc list-inside ml-6">
                        <li>Case name</li>
                        <li>Volume number</li>
                        <li>Reporter abbreviation</li>
                        <li>First page of the case</li>
                        <li>Parenthetical with the year</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Facts:</strong>
                      <p className="text-base mt-1">Summarize only the facts essential to the decision:</p>
                      <ul className="list-disc list-inside ml-6">
                        <li>Identify the parties involved</li>
                        <li>Explain key events leading to the dispute</li>
                        <li>Note relevant procedural history</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Issue:</strong>
                      <p className="text-base mt-1">Frame the precise legal question:</p>
                      <ul className="list-disc list-inside ml-6">
                        <li>Start with “Whether…” or “Did…”</li>
                        <li>Focus on the point of law decided</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Holding:</strong>
                      <p className="text-base mt-1">State the court’s answer to the issue:</p>
                      <ul className="list-disc list-inside ml-6">
                        <li>Yes or No response</li>
                        <li>Concise rationale</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Reasoning:</strong>
                      <p className="text-base mt-1">Outline the court’s logic:</p>
                      <ul className="list-disc list-inside ml-6">
                        <li>Statutes or precedents relied upon</li>
                        <li>Key arguments and policy considerations</li>
                        <li>Difference between majority and concurrence</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Concurring and Dissenting Opinions:</strong>
                      <p className="text-base mt-1">Highlight alternate views:</p>
                      <ul className="list-disc list-inside ml-6">
                        <li>Main points of concurring opinions</li>
                        <li>Key arguments in dissents</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Analysis:</strong>
                      <p className="text-base mt-1">Discuss implications and your evaluation:</p>
                      <ul className="list-disc list-inside ml-6">
                        <li>Impact on future cases</li>
                        <li>Strengths and weaknesses of the decision</li>
                        <li>Comparisons with related cases</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Conclusion:</strong>
                      <p className="text-base mt-1">Summarize the significance and key takeaways in one or two sentences.</p>
                    </li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export { CaseSummaries }
