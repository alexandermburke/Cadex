'use client'
import React, { useState, useRef } from 'react'
import clsx from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import { FaBars, FaTimes, FaUpload, FaPlay, FaDownload, FaShareAlt } from 'react-icons/fa'
import Sidebar from '../Sidebar'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export default function ApplicationReview() {
  const router = useRouter()
  const { currentUser, userDataObj } = useAuth()
  const isDarkMode = userDataObj?.darkMode || false
  const [isSidebarVisible, setIsSidebarVisible] = useState(true)
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible)
  const [file, setFile] = useState(null)
  const [fileUrl, setFileUrl] = useState('/default.pdf')
  const [feedback, setFeedback] = useState('')
  const [status, setStatus] = useState('')
  const feedbackRef = useRef(null)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setFeedback('')
      setStatus('File selected. Ready for review.')
      setFileUrl(URL.createObjectURL(selectedFile))
    }
  }

  const handleReview = async () => {
    if (!file) {
      setStatus('Please upload your application PDF first.')
      return
    }
    setStatus('Reviewing your application...')
    setFeedback('')
    await new Promise(resolve => setTimeout(resolve, 1500))
    setFeedback('Your application shows promising strengths in academic achievements and extracurricular activities. The personal statement is articulate, yet consider adding more specific examples to strengthen your narrative. Overall, a commendable submission with room for improvement.')
    setStatus('Review complete.')
  }

  const handleShare = async () => {
    const shareUrl = window.location.href
    const shareData = {
      title: 'Law School Application Review Feedback',
      text: 'Check out my AI review feedback on my law school application.',
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

  const saveAsPDF = async () => {
    if (!feedbackRef.current) return
    const originalStyle = feedbackRef.current.style.fontSize
    feedbackRef.current.style.fontSize = '24px'
    const canvas = await html2canvas(feedbackRef.current, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save('application-review.pdf')
    feedbackRef.current.style.fontSize = originalStyle
  }

  if (!currentUser) {
    return (
      <div className={clsx('flex items-center justify-center h-full transition-colors', isDarkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-800')}>
        <div className={clsx('p-6 rounded-2xl shadow-xl text-center', isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white border border-slate-700' : 'bg-white text-gray-800 border border-gray-300')}>
          <p className="mb-4 text-lg font-semibold">Please log in to access the Application Review.</p>
          <button onClick={() => router.push('/login')} className={clsx('px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-300', isDarkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-950 hover:bg-blue-800 text-white')}>
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeInOut' } }
  }

  return (
    <div className={clsx('relative flex h-screen transition-colors duration-500', isDarkMode ? 'text-white' : 'text-gray-800')}>
      <AnimatePresence>
        {isSidebarVisible && (
          <>
            <Sidebar activeLink="/lawtools/applicationreview" isSidebarVisible={isSidebarVisible} toggleSidebar={toggleSidebar} isDarkMode={isDarkMode} />
            <motion.div className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={toggleSidebar} />
          </>
        )}
      </AnimatePresence>
      <main className="flex-1 flex flex-col px-6 relative z-50 h-screen">
        <div className="flex items-center justify-between mt-4">
          <button onClick={toggleSidebar} className={clsx('text-blue-900 dark:text-white p-2 rounded transition-colors hover:bg-black/10 focus:outline-none md:hidden')} aria-label={isSidebarVisible ? 'Hide Sidebar' : 'Show Sidebar'}>
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
        <motion.div className={clsx('flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto', isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white border border-slate-700' : 'bg-white text-gray-800 border border-gray-300')} variants={containerVariants} initial="hidden" animate="visible">
          <h1 className="text-3xl font-bold mb-6 text-center">Law School Application Review</h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col space-y-6">
              <div className={clsx('p-6 rounded-lg shadow-md flex flex-col space-y-4', isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white border border-slate-700' : 'bg-white text-gray-800 border border-gray-300')}>
                <h2 className="text-2xl font-bold">{file ? 'Review Your Submission' : 'Submit Your Application'}</h2>
                <p className="text-base">Upload your law school application PDF to get AI-powered feedback on your submission.</p>
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <label htmlFor="upload-file" className={clsx('cursor-pointer inline-flex items-center px-4 py-2 rounded text-sm font-medium', isDarkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-950 hover:bg-blue-800 text-white')}>
                    <FaUpload className="mr-2" />
                    Select PDF
                  </label>
                  <input id="upload-file" type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
                  <button onClick={handleReview} className={clsx('flex items-center justify-center gap-2 px-4 py-2 rounded text-sm font-medium', isDarkMode ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-green-950 hover:bg-green-800 text-white')}>
                    <FaPlay />
                    <span>Review Application</span>
                  </button>
                </div>
                {status && <p className="text-sm italic">{status}</p>}
              </div>
              <div className={clsx('p-6 rounded-lg shadow-md', isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white border border-slate-700' : 'bg-white text-gray-800 border border-gray-300')}>
                <h2 className="text-2xl font-bold">Next Steps</h2>
                <ul className="list-disc list-inside text-base mt-2">
                  <li>Refine your personal statement using the feedback provided.</li>
                  <li>Incorporate specific examples to strengthen your narrative.</li>
                  <li>Consult mentors and peers for further insights.</li>
                  <li>Review your resume and academic records.</li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col space-y-6">
              <div className={clsx('p-6 rounded-lg shadow-md', isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white border border-slate-700' : 'bg-white text-gray-800 border border-gray-300')}>
                <h2 className="text-2xl font-bold">Submission Preview</h2>
                <div className="relative w-full h-80 rounded-md overflow-hidden">
                  <embed src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} type="application/pdf" className="absolute top-0 left-0 w-full h-full" style={{ margin: 0, padding: 0 }} />
                </div>
                <p className="text-xs italic mt-2">{file ? 'Preview of your uploaded PDF.' : 'Currently showing default.pdf'}</p>
              </div>
              <div className={clsx('p-6 rounded-lg shadow-md', isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white border border-slate-700' : 'bg-white text-gray-800 border border-gray-300')}>
                <h2 className="text-2xl font-bold">AI Feedback</h2>
                {feedback ? (
                  <div ref={feedbackRef} className="mt-2 whitespace-pre-wrap text-base">
                    {feedback}
                  </div>
                ) : (
                  <p className="mt-2 text-base">Your AI review feedback will appear here after submission.</p>
                )}
              </div>
            </div>
          </div>
          <div className="mt-8 flex items-center justify-center space-x-4">
            <button onClick={saveAsPDF} className={clsx('flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold', isDarkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-950 hover:bg-blue-800 text-white')}>
              <FaDownload />
              <span>Download Feedback</span>
            </button>
            <button onClick={handleShare} className={clsx('flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold', isDarkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-950 hover:bg-blue-800 text-white')}>
              <FaShareAlt />
              <span>Share Feedback</span>
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
