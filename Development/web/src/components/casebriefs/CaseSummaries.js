'use client'
import React, { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Sidebar from '../Sidebar'
import { useRouter, useSearchParams } from 'next/navigation'
import { FaBars, FaTimes, FaHeart, FaRegHeart, FaSync, FaDownload, FaShareAlt } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '@/firebase'
import { doc, getDoc, updateDoc, collection, query, where, limit, getDocs } from 'firebase/firestore'
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
  if (isNaN(parsed)) return '____'
  return parsed.getFullYear()
}

const getCitation = (caseObj, style, page = '___') => {
  const year = parseYear(caseObj.decisionDate)
  const title = caseObj.title || 'N/A'
  const volume = caseObj.volume || '___'
  const reporter = 'U.S.'
  switch (style) {
    case 'bluebook':
      return `${title}, ${volume} ${reporter} ${page} (${year}).`
    case 'ieee':
      return `${title}, ${volume} ${reporter} ${page}, ${caseObj.decisionDate || '____'}.`
    case 'apa':
      return `${title} (${year}). ${volume} ${reporter} ${page}.`
    case 'mla':
      return `"${title}." ${volume} ${reporter} ${page} (${year}).`
    case 'chicago':
      return `${title}, ${volume} ${reporter} ${page} (${year}).`
    case 'ama':
      return `${title}. ${volume} ${reporter} ${page} (${year}).`
    default:
      return `${title}, ${volume} ${reporter} ${page} (${year}).`
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
  } catch (error) {
    console.error('Error generating PDF:', error)
  }
}

function getInitialViewMode() {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('caseBriefViewMode')
    if (stored && ['classic', 'bulletpoint', 'simplified'].includes(stored)) return stored
  }
  return 'classic'
}

export default function CaseSummaries() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { currentUser, userDataObj } = useAuth()
  const isLoggedIn = !!currentUser
  const plan = userDataObj?.billing?.plan?.toLowerCase() || 'free'
  const isPro = plan === 'pro'
  const isExpert = plan === 'expert'
  const isDarkMode = userDataObj?.darkMode || false

  const [isSidebarVisible, setIsSidebarVisible] = useState(true)
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible)

  const [capCase, setCapCase] = useState(null)
  const [caseBrief, setCaseBrief] = useState(null)
  const [isSummaryLoading, setIsSummaryLoading] = useState(false)
  const [reRunCount, setReRunCount] = useState(0)
  const [isVerified, setIsVerified] = useState(false)

  const queryCaseId = searchParams.get('caseId')
  const capCaseId = queryCaseId || localStorage.getItem('lastCapCaseId')
  const pdfRef = useRef(null)

  const viewModes = [
    { label: 'Classic', value: 'classic' },
    { label: 'Bullets', value: 'bulletpoint' },
    { label: 'Simple', value: 'simplified' }
  ]
  const [viewMode, setViewMode] = useState(getInitialViewMode)
  useEffect(() => {
    localStorage.setItem('caseBriefViewMode', viewMode)
  }, [viewMode])
  const selectedIndex = viewModes.findIndex((m) => m.value === viewMode)

  const [relatedCases, setRelatedCases] = useState([])
  const [favorites, setFavorites] = useState([])
  const [isFavorited, setIsFavorited] = useState(false)
  const [favoriteCases, setFavoriteCases] = useState([])
  const [selectedFavorite, setSelectedFavorite] = useState(null)
  const [citationStyle, setCitationStyle] = useState('bluebook')

  useEffect(() => {
    if (userDataObj && Array.isArray(userDataObj.favorites)) setFavorites(userDataObj.favorites)
  }, [userDataObj])
  useEffect(() => {
    if (capCase && favorites.includes(capCase.id)) setIsFavorited(true)
    else setIsFavorited(false)
  }, [capCase, favorites])
  const toggleFavoriteCase = async () => {
    if (!capCase) return
    if (!isLoggedIn) {
      alert('Please log in to favorite cases.')
      return
    }
    try {
      const userDocRef = doc(db, 'users', currentUser.uid)
      let updatedFavorites
      if (favorites.includes(capCase.id)) {
        updatedFavorites = favorites.filter((id) => id !== capCase.id)
        setIsFavorited(false)
      } else {
        updatedFavorites = [...favorites, capCase.id]
        setIsFavorited(true)
      }
      setFavorites(updatedFavorites)
      await updateDoc(userDocRef, { favorites: updatedFavorites })
    } catch (error) {
      console.error('Error toggling favorite:', error)
      alert('Error toggling favorite.')
    }
  }
  useEffect(() => {
    if (capCaseId && caseBrief) {
      localStorage.setItem(`caseBrief_${capCaseId}`, JSON.stringify(caseBrief))
      localStorage.setItem('lastCapCaseId', capCaseId)
    }
  }, [caseBrief, capCaseId])
  useEffect(() => {
    if (capCaseId) {
      const savedBrief = localStorage.getItem(`caseBrief_${capCaseId}`)
      if (savedBrief) setCaseBrief(JSON.parse(savedBrief))
    }
  }, [capCaseId])
  useEffect(() => {
    if (!userDataObj) return
    if (Array.isArray(userDataObj.favorites)) {
      const fetchFavorites = async () => {
        let favs = []
        for (const favId of userDataObj.favorites) {
          try {
            const favDoc = await getDoc(doc(db, 'capCases', favId))
            if (favDoc.exists()) favs.push({ id: favDoc.id, ...favDoc.data() })
          } catch (error) {
            console.error('Error fetching favorite case:', error)
          }
        }
        setFavoriteCases(favs)
      }
      fetchFavorites()
    }
  }, [userDataObj])
  useEffect(() => {
    if (favoriteCases.length > 0) {
      const savedFavId = localStorage.getItem('selectedFavoriteForSummary')
      if (savedFavId) {
        const fav = favoriteCases.find((c) => c.id === savedFavId)
        if (fav) setSelectedFavorite(fav)
      }
    }
  }, [favoriteCases])
  const fetchFavoriteCaseSummary = async (fav) => {
    try {
      const favDoc = await getDoc(doc(db, 'capCases', fav.id))
      if (favDoc.exists()) {
        const fetchedCase = { id: favDoc.id, ...favDoc.data() }
        setCapCase(fetchedCase)
        if (viewMode === 'simplified') {
          if (fetchedCase.briefSummary) setCaseBrief(fetchedCase.briefSummary)
          else setCaseBrief({ error: 'No summary available from favorite case.' })
        } else {
          if (fetchedCase.detailedSummary) setCaseBrief(fetchedCase.detailedSummary)
          else setCaseBrief({ error: 'No summary available from favorite case.' })
        }
      } else setCaseBrief({ error: 'Favorite case not found in database.' })
    } catch (error) {
      console.error('Error fetching favorite case summary:', error)
      setCaseBrief({ error: 'Error fetching favorite case summary.' })
    }
  }
  const renderFactsContent = (factsText) => {
    if (!factsText) return <p className="text-base mt-2">Not provided.</p>
    const enumeratedFacts = factsText.match(/(\d+\.\s[\s\S]*?)(?=\d+\.\s|$)/g)
    if (viewMode === 'simplified')
      return <p className={`text-base mt-2 ${!isLoggedIn ? 'blur-sm' : ''}`}>{simplifyText(factsText)}</p>
    if (enumeratedFacts && enumeratedFacts.length > 0) {
      if (viewMode === 'bulletpoint')
        return (
          <ul className={`list-disc list-inside text-base mt-2 ${!isLoggedIn ? 'blur-sm' : ''}`}>
            {enumeratedFacts.map((fact, index) => {
              const strippedFact = fact.replace(/^\d+\.\s*/, '')
              return <li key={index}>{strippedFact.trim()}</li>
            })}
          </ul>
        )
      return (
        <>
          {enumeratedFacts.map((fact, index) => {
            const strippedFact = fact.replace(/^\d+\.\s*/, '')
            return (
              <p key={index} className={`text-base mt-2 ${!isLoggedIn ? 'blur-sm' : ''}`}>
                {strippedFact.trim()}
              </p>
            )
          })}
        </>
      )
    }
    return <p className={`text-base mt-2 ${!isLoggedIn ? 'blur-sm' : ''}`}>{factsText}</p>
  }
  const renderFieldContent = (fieldText) => {
    if (!fieldText) return 'Not provided.'
    if (viewMode === 'bulletpoint')
      return (
        <ul className="list-disc list-inside text-base mt-2">
          <li>{fieldText}</li>
        </ul>
      )
    else if (viewMode === 'simplified')
      return <p className={`text-base mt-2 ${!isLoggedIn ? 'blur-sm' : ''}`}>{simplifyText(fieldText)}</p>
    return <p className={`text-base mt-2 ${!isLoggedIn ? 'blur-sm' : ''}`}>{fieldText}</p>
  }
  const shareCase = async () => {
    if (!capCase) return
    const shareUrl = `${window.location.origin}/casebriefs/summaries?caseId=${capCase.id}`
    const shareData = {
      title: capCase.title,
      text: 'Check out this case brief on CadexLaw',
      url: shareUrl
    }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      navigator.clipboard.writeText(shareUrl)
      alert('URL copied to clipboard')
    }
  }
  const reGenerateSummary = async () => {
    if (!capCase) return
    if (viewMode === 'simplified') await getCapCaseBriefSummary(capCase)
    else await getCapCaseSummary(capCase)
  }
  useEffect(() => {
    if (!capCaseId) return
    const fetchCapCaseAndSummary = async () => {
      try {
        const docRef = doc(db, 'capCases', capCaseId)
        const docSnap = await getDoc(docRef)
        if (!docSnap.exists()) {
          console.error(`Case with ID ${capCaseId} not found.`)
          return
        }
        const fetchedCase = { id: docSnap.id, ...docSnap.data() }
        setCapCase(fetchedCase)
        if (viewMode === 'simplified') {
          if (fetchedCase.briefSummary) {
            setCaseBrief(fetchedCase.briefSummary)
            if (fetchedCase.briefSummary.verified === true) setIsVerified(true)
            else await verifyBriefSummary(fetchedCase.briefSummary, fetchedCase)
          } else await getCapCaseBriefSummary(fetchedCase)
        } else {
          if (fetchedCase.detailedSummary) {
            setCaseBrief(fetchedCase.detailedSummary)
            if (fetchedCase.detailedSummary.verified === true) setIsVerified(true)
            else await verifyDetailedSummary(fetchedCase.detailedSummary, fetchedCase)
          } else await getCapCaseSummary(fetchedCase)
        }
      } catch (error) {
        console.error('Error fetching the capCase:', error)
      }
    }
    fetchCapCaseAndSummary()
  }, [capCaseId, viewMode])
  useEffect(() => {
    if (!capCase) return
    const fetchRelatedCases = async () => {
      try {
        const q = query(
          collection(db, 'capCases'),
          where('jurisdiction', '==', capCase.jurisdiction || ''),
          where('__name__', '!=', capCase.id),
          limit(3)
        )
        const querySnap = await getDocs(q)
        const results = []
        querySnap.forEach((docItem) => {
          results.push({ id: docItem.id, ...docItem.data() })
        })
        setRelatedCases(results)
      } catch (e) {
        console.error('Error fetching related cases:', e)
      }
    }
    fetchRelatedCases()
  }, [capCase])
  const getCapCaseSummary = async (capCaseObj) => {
    setIsSummaryLoading(true)
    setCaseBrief(null)
    try {
      const payload = {
        title: capCaseObj.title,
        date: capCaseObj.decisionDate || '',
        detailed: true
      }
      const res = await fetch('/api/casebrief-detailed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const errorData = await res.json()
        console.error('Failed to get summary:', errorData.error)
        setCaseBrief({ error: errorData.error || 'No summary available.' })
        return
      }
      const data = await res.json()
      setCaseBrief(data)
      await updateDoc(doc(db, 'capCases', capCaseObj.id), {
        detailedSummary: {
          ruleOfLaw: data.ruleOfLaw || '',
          facts: data.facts || '',
          issue: data.issue || '',
          holding: data.holding || '',
          reasoning: data.reasoning || '',
          dissent: data.dissent || '',
          verified: false
        }
      })
      setCapCase((prev) =>
        prev ? { ...prev, detailedSummary: { ...data, verified: false } } : null
      )
      await verifyDetailedSummary(data, capCaseObj)
    } catch (err) {
      console.error('Error fetching summary for full view:', err)
      setCaseBrief({ error: 'Error fetching summary.' })
    } finally {
      setIsSummaryLoading(false)
    }
  }
  const getCapCaseBriefSummary = async (capCaseObj) => {
    setIsSummaryLoading(true)
    setCaseBrief(null)
    try {
      const payload = {
        title: capCaseObj.title,
        date: capCaseObj.decisionDate || ''
      }
      const res = await fetch('/api/casebrief-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const errorData = await res.json()
        console.error('Failed to get brief summary:', errorData.error)
        setCaseBrief({ error: errorData.error || 'No summary available.' })
        return
      }
      const data = await res.json()
      setCaseBrief(data)
      await updateDoc(doc(db, 'capCases', capCaseObj.id), {
        briefSummary: {
          ruleOfLaw: data.ruleOfLaw || '',
          facts: data.facts || '',
          issue: data.issue || '',
          holding: data.holding || '',
          reasoning: data.reasoning || '',
          dissent: data.dissent || '',
          verified: false
        }
      })
      setCapCase((prev) =>
        prev ? { ...prev, briefSummary: { ...data, verified: false } } : null
      )
      await verifyBriefSummary(data, capCaseObj)
    } catch (err) {
      console.error('Error fetching brief summary for simple view:', err)
      setCaseBrief({ error: 'Error fetching summary.' })
    } finally {
      setIsSummaryLoading(false)
    }
  }
  const verifyDetailedSummary = async (summaryData, capCaseObj) => {
    try {
      const verifyRes = await fetch('/api/casebrief-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          briefSummary: summaryData,
          caseTitle: capCaseObj.title,
          decisionDate: capCaseObj.decisionDate,
          jurisdiction: capCaseObj.jurisdiction
        })
      })
      const verifyData = await verifyRes.json()
      if (verifyData.verified === true) {
        await updateDoc(doc(db, 'capCases', capCaseObj.id), { 'detailedSummary.verified': true })
        setIsVerified(true)
      } else {
        console.log('Verification explanation:', verifyData.explanation)
        setIsVerified(false)
        if (reRunCount < 5) {
          setReRunCount((prev) => prev + 1)
          await getCapCaseSummary(capCaseObj)
        } else {
          setCaseBrief({ error: 'Verification failed after 5 attempts. Please try again later.' })
        }
      }
    } catch (verifyError) {
      console.error('Error verifying summary:', verifyError)
      setIsVerified(false)
    }
  }
  const verifyBriefSummary = async (summaryData, capCaseObj) => {
    try {
      const verifyRes = await fetch('/api/casebrief-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          briefSummary: summaryData,
          caseTitle: capCaseObj.title,
          decisionDate: capCaseObj.decisionDate,
          jurisdiction: capCaseObj.jurisdiction
        })
      })
      const verifyData = await verifyRes.json()
      if (verifyData.verified === true) {
        await updateDoc(doc(db, 'capCases', capCaseObj.id), { 'briefSummary.verified': true })
        setIsVerified(true)
      } else {
        console.log('Verification explanation:', verifyData.explanation)
        setIsVerified(false)
        if (reRunCount < 5) {
          setReRunCount((prev) => prev + 1)
          await getCapCaseBriefSummary(capCaseObj)
        } else {
          setCaseBrief({ error: 'Verification failed after 5 attempts. Please try again later.' })
        }
      }
    } catch (verifyError) {
      console.error('Error verifying brief summary:', verifyError)
      setIsVerified(false)
    }
  }
  const saveAsPDFHandler = async () => {
    await saveAsPDF(pdfRef, capCase?.title)
  }
  const headingByMode = {
    classic: 'Case Brief (Classic)',
    bulletpoint: 'Case Brief (Bullets)',
    simplified: 'Case Brief (Simple)'
  }
  const structuredData = capCase
    ? {
        '@context': 'https://schema.org',
        '@type': 'LegalCase',
        name: capCase.title,
        datePublished: capCase.decisionDate,
        jurisdiction: capCase.jurisdiction,
        description: caseBrief ? caseBrief.facts || caseBrief.ruleOfLaw || '' : '',
        url: typeof window !== 'undefined' ? window.location.href : ''
      }
    : null

  return (
    <>
      {capCase && (
        <Head>
          <title>{capCase.title} | CadexLaw Case Brief Summary</title>
          <meta name="description" content={`${capCase.title} case brief summary from ${capCase.jurisdiction || 'Unknown jurisdiction'}. Preview the case details and subscribe for full access.`} />
          <meta name="keywords" content="case brief, legal summary, CadexLaw, legal cases, case law" />
          <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
          {structuredData && (
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
          )}
        </Head>
      )}
      <div ref={pdfRef} className={`relative flex h-screen transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        <AnimatePresence>
          {isSidebarVisible && (
            <>
              <Sidebar activeLink="/casebriefs/summaries" isSidebarVisible={isSidebarVisible} toggleSidebar={toggleSidebar} isDarkMode={isDarkMode} />
              <motion.div className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={toggleSidebar} />
            </>
          )}
        </AnimatePresence>
        <main className="flex-1 flex flex-col px-6 relative z-50 h-screen">
          <div className="flex items-center justify-between">
            <button onClick={toggleSidebar} className="text-blue-900 dark:text-white p-2 rounded transition-colors hover:bg-black/10 focus:outline-none md:hidden" aria-label={isSidebarVisible ? 'Hide Sidebar' : 'Show Sidebar'}>
              <AnimatePresence mode="wait" initial={false}>
                {isSidebarVisible ? (
                  <motion.div key="close-icon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.3 }}>
                    <FaTimes size={20} />
                  </motion.div>
                ) : (
                  <motion.div key="bars-icon" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.3 }}>
                    <FaBars size={20} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
          <div className={`flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto overflow-x-auto ${isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white' : 'bg-white text-gray-800'} flex flex-col items-center`}>
            <h1 className="text-2xl font-bold mb-4">{headingByMode[viewMode]}</h1>
            <div className={`p-6 rounded-xl mb-6 ${isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white border border-slate-700' : 'bg-gray-100 text-gray-800 border border-gray-300'}`}>
              <h2 className="text-xl font-semibold">{capCase?.title}</h2>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {capCase?.jurisdiction || 'Unknown'} | Volume: {capCase?.volume || 'N/A'} | Date: {capCase?.decisionDate || 'N/A'}
              </p>
              <p className={`text-sm mt-1 font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Citation: <span className="font-normal">{capCase?.citation || 'N/A'}</span>
              </p>
              <div className="flex items-center text-xs mt-1">
                <span className="text-gray-400">Verified by LExAPI 3.0 ({viewMode})</span>
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
                <motion.div className={`absolute top-0 left-0 h-full rounded-full ${isDarkMode ? 'bg-slate-600' : 'bg-white'} shadow`} style={{ width: '33.33%' }} initial={false} animate={{ x: `${selectedIndex * 100}%` }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                {viewModes.map((mode, i) => (
                  <button key={mode.value} onClick={() => setViewMode(mode.value)} className={`relative z-10 flex-1 text-xs sm:text-sm font-semibold py-1 transition-colors ${selectedIndex === i ? (isDarkMode ? 'text-blue-300' : 'text-blue-600') : isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="w-full relative">
              {isSummaryLoading ? (
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="relative w-16 h-16">
                    <svg className="transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-gray-300" strokeWidth="4" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-blue-500 animate-progress" strokeWidth="4" strokeLinecap="round" fill="none" strokeDasharray="25, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                  </div>
                  <div className="text-sm text-gray-400">We are verifying the Case Brief, please wait...</div>
                </div>
              ) : caseBrief ? (
                <div className="p-6 rounded-xl relative z-10">
                  <h3 className={`font-bold mb-4 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'} text-lg`}>
                    {viewMode === 'simplified' ? 'Brief Case Summary' : viewMode === 'bulletpoint' ? 'Bulletpoint Summary' : 'Detailed Case Brief'}
                  </h3>
                  <div className="mb-4">
                    <strong className="block text-lg">Rule of Law:</strong>
                    {caseBrief.ruleOfLaw && <p className={`text-base mt-2`}>{caseBrief.ruleOfLaw}</p>}
                  </div>
                  <div className="mb-4">
                    <strong className="block text-lg">Facts:</strong>
                    {caseBrief.facts ? renderFactsContent(caseBrief.facts) : <p className={`text-base mt-2 ${!isLoggedIn ? 'blur-sm' : ''}`}>Not provided.</p>}
                  </div>
                  <div className="mb-4">
                    <strong className="block text-lg">Issue:</strong>
                    {caseBrief.issue && <p className={`text-base mt-2 ${!isLoggedIn ? 'blur-sm' : ''}`}>{caseBrief.issue}</p>}
                  </div>
                  <div className="mb-4">
                    <strong className="block text-lg">Holding:</strong>
                    {caseBrief.holding && <p className={`text-base mt-2 ${!isLoggedIn ? 'blur-sm' : ''}`}>{caseBrief.holding}</p>}
                  </div>
                  <div className="mb-4">
                    <strong className="block text-lg">Reasoning:</strong>
                    {caseBrief.reasoning && <p className={`text-base mt-2 ${!isLoggedIn ? 'blur-sm' : ''}`}>{caseBrief.reasoning}</p>}
                  </div>
                  <div className="mb-4">
                    <strong className="block text-lg">Dissent:</strong>
                    {caseBrief.dissent && <p className={`text-base mt-2 ${!isLoggedIn ? 'blur-sm' : ''}`}>{caseBrief.dissent}</p>}
                  </div>
                  {!isLoggedIn && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-xl font-bold">
                      <button onClick={() => router.push('/register')} className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg gradientShadowHoverBlue">
                        Register to View Full Case Brief
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full flex flex-col items-center">
                  <p className="text-sm text-gray-400 mb-2">View All Briefs to Select a Case Brief.</p>
                  <select className="p-2 rounded-md border border-gray-300 max-w-md" onChange={(e) => {
                      const fav = favoriteCases.find((c) => c.id === e.target.value)
                      setSelectedFavorite(fav)
                      localStorage.setItem('selectedFavoriteForSummary', e.target.value)
                      if (fav) fetchFavoriteCaseSummary(fav)
                    }} value={selectedFavorite ? selectedFavorite.id : ''}>
                    <option value="">Select a favorite case</option>
                    {favoriteCases.map((fav) => (
                      <option key={fav.id} value={fav.id}>
                        {fav.title} ({fav.jurisdiction || 'Unknown'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="w-full mt-8">
              <h2 className="text-lg font-bold mb-2 text-center">Related Cases</h2>
              <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full" layout>
                <AnimatePresence>
                  {relatedCases && relatedCases.length > 0 ? (
                    relatedCases.map((rcase) => (
                      <motion.div key={rcase.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.3 }} className={`p-4 rounded-xl shadow-lg cursor-pointer ${isDarkMode ? 'bg-slate-800 bg-opacity-50 border border-slate-700 text-white' : 'bg-white border border-gray-300 text-gray-800'} hover:shadow-xl transition-shadow`} onClick={() => router.push(`/casebriefs/summaries?caseId=${rcase.id}`)}>
                        <h3 className="text-lg font-semibold mb-2 truncate">{rcase.title}</h3>
                        <p className="text-sm">{rcase.jurisdiction || 'Unknown'}</p>
                        <p className="text-xs mt-1 text-gray-400">
                          Volume: {rcase.volume || 'N/A'} | Date: {rcase.decisionDate || 'N/A'}
                        </p>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 col-span-full text-center">No related cases found.</p>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
            {capCase && (
              <div className="w-full mt-8">
                <h2 className="text-lg font-bold mb-2">Citation Generator</h2>
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800 bg-opacity-50 border border-slate-700' : 'bg-gray-100 border border-gray-300'}`}>
                  <label htmlFor="citationStyle" className="block mb-2 font-semibold">Select Citation Style:</label>
                  <select id="citationStyle" value={citationStyle} onChange={(e) => setCitationStyle(e.target.value)} className={`p-2 rounded-md ${isDarkMode ? 'bg-slate-700 border border-slate-600 text-white' : 'bg-white border border-gray-300 text-gray-800'}`}>
                    <option value="bluebook">Bluebook</option>
                    <option value="ieee">IEEE</option>
                    <option value="apa">APA</option>
                    <option value="mla">MLA</option>
                    <option value="chicago">Chicago</option>
                    <option value="ama">AMA</option>
                  </select>
                  <div className="mt-4">
                    <p className="text-base italic">{getCitation(capCase, citationStyle, '113')}</p>
                  </div>
                </div>
              </div>
            )}
            {isLoggedIn && (
              <motion.button onClick={saveAsPDFHandler} whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9, rotate: -5 }} className="mt-6 p-3 rounded-full bg-blue-600 text-white shadow-lg" aria-label="Save as PDF">
                <FaDownload size={24} />
              </motion.button>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
