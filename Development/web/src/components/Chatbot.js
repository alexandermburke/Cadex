'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { FaComments, FaTimes, FaStar, FaRegStar, FaCopy } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

export default function Chatbot() {
  const { currentUser } = useAuth()
  const isLoggedIn = !!currentUser

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const messagesContainerRef = useRef(null)

  const words = ['Case Briefs', 'Summaries', 'Flashcards', 'AI Exams', 'Definitions', 'IRAC']
  const [currentWordIndex, setCurrentWordIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [words.length])

  const toggleChat = () => setIsOpen((prev) => !prev)

  const handleSend = async () => {
    if (!isLoggedIn) {
      alert('Please log in to use the chat.')
      return
    }
    if (!input.trim()) return
    const userText = input
    setInput('')
    const userMessage = { text: userText, sender: 'user' }
    setMessages((prev) => [...prev, userMessage])
    setLoading(true)

    try {
      const response = await fetch('/api/Chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userText }),
      })

      if (!response.ok) throw new Error('Failed to fetch legal answer.')

      const data = await response.json()
      const answer = data.answer || 'No answer provided.'
      const source = data.source || ''
      const botMessage = { answer, source, sender: 'bot', saved: false, nonSavable: false }
      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error('Error fetching legal answer:', error)
      const errorMsg = {
        text: 'Sorry, an error occurred while fetching the legal answer.',
        sender: 'bot',
        saved: false,
        nonSavable: false,
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isOpen) {
        setShowTooltip(true)
        setTimeout(() => setShowTooltip(false), 5000)
      }
    }, 180000)
    return () => clearInterval(interval)
  }, [isOpen])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greetingMessage = {
        answer: "Welcome to LExAPI. Please feel free to submit any law school related inquiries.",
        source: "",
        sender: "bot",
        saved: false,
        nonSavable: true,
      }
      setMessages([greetingMessage])
    }
  }, [isOpen, messages.length])

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    const savedMessages = messages.filter(
      (msg) => msg.sender === 'bot' && msg.saved && !msg.nonSavable
    )
    localStorage.setItem('LExAPI_savedMessages', JSON.stringify(savedMessages))
  }, [messages])

  const toggleSave = (index) => {
    setMessages((prev) => {
      const newMessages = [...prev]
      const msg = newMessages[index]
      if (msg.sender === 'bot' && !msg.nonSavable) {
        newMessages[index] = { ...msg, saved: !msg.saved }
      }
      return newMessages
    })
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div>
      <AnimatePresence>
        {showTooltip && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.5 }}
            className="fixed bottom-16 right-4 text-blue-600 text-sm px-3 py-2 rounded shadow-lg z-50"
          >
            Need assistance? Click to chat.
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-20 right-4 w-96 max-w-full bg-white bg-opacity-90 dark:bg-gray-800 dark:bg-opacity-90 border border-gray-200 dark:border-gray-600 rounded-2xl shadow-xl p-6 z-50 overflow-y-auto backdrop-blur-lg transition-all"
          style={{ maxHeight: '70vh' }}
        >
          <div className="flex flex-col mb-4">
            <div className="flex justify-between items-center border-b pb-2 mb-2">
              <h4 className="font-bold text-xl text-gray-900 dark:text-gray-100">
                LExAPI 3.0 Chatbot
              </h4>
              <button
                onClick={toggleChat}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FaTimes className="text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            {!isLoggedIn && (
              <div className="text-center text-red-600 mb-4">
                Please log in to send messages.
              </div>
            )}
            <p className="text-gray-500 italic text-xs">
              This feature is currently in beta and subject to ongoing enhancements.
            </p>
          </div>

          <div ref={messagesContainerRef} className="space-y-4 mb-4 max-h-80 overflow-y-auto">
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: msg.sender === 'user' ? 40 : -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'user' ? (
                  <span className="inline-block px-4 py-2 rounded-2xl max-w-xs whitespace-pre-wrap break-words bg-blue-600 text-white shadow-md text-sm">
                    {msg.text}
                  </span>
                ) : (
                  <div className="max-w-xs relative">
                    <div className="inline-block w-full px-4 py-3 rounded-2xl whitespace-pre-wrap break-words bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 pr-10 pb-8 text-sm">
                      <p>{msg.answer || msg.text}</p>
                      {msg.source && (
                        <ul className="list-disc pl-5 mt-2 text-sm text-blue-700">
                          {msg.source.split('\n').map((src, idx) => {
                            const trimmedSrc = src.trim()
                            if (!trimmedSrc) return null
                            const isURL = trimmedSrc.startsWith('http://') || trimmedSrc.startsWith('https://')
                            return (
                              <li key={idx}>
                                {isURL ? (
                                  <a
                                    href={trimmedSrc}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline"
                                  >
                                    {trimmedSrc}
                                  </a>
                                ) : (
                                  trimmedSrc
                                )}
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </div>
                    {!msg.nonSavable && (
                      <div className="absolute bottom-2 right-2 flex space-x-2">
                        <motion.span onClick={() => toggleSave(index)} whileTap={{ scale: 0.8 }} className="cursor-pointer">
                          {msg.saved ? (
                            <FaStar className="text-yellow-400" size={18} />
                          ) : (
                            <FaRegStar className="text-gray-400" size={18} />
                          )}
                        </motion.span>
                        <motion.span onClick={() => handleCopy(msg.answer)} whileTap={{ scale: 0.8 }} className="cursor-pointer">
                          <FaCopy className="text-gray-400" size={18} />
                        </motion.span>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
            {loading && (
              <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="flex justify-start">
                <span className="inline-block px-4 py-2 rounded-2xl bg-gray-200 text-gray-600 shadow-md text-sm">
                  Sending...
                </span>
              </motion.div>
            )}
          </div>

          <div className="flex">
            <input
              type="text"
              className="flex-1 border border-gray-300 dark:border-gray-700 text-sm rounded-l-xl p-2 focus:outline-none transition-colors"
              placeholder={isLoggedIn ? 'Ask your law school questions...' : 'Please log in to chat'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={!isLoggedIn || loading}
            />
            <button
              onClick={handleSend}
              className="bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white px-4 py-2 rounded-r-xl transition-colors"
              disabled={!isLoggedIn || loading}
            >
              Send
            </button>
          </div>
        </motion.div>
      )}

      <motion.button
        onClick={toggleChat}
        initial={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-full px-6 py-3 shadow-2xl z-50 flex items-center space-x-2 transition-colors"
      >
        <FaComments />
        <span>Ask about</span>
        <span className="relative inline-block leading-none" style={{ height: '1em', width: '5em', overflow: 'hidden' }}>
          <AnimatePresence mode="popLayout">
            <motion.span
              key={words[currentWordIndex]}
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '-100%', opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-left justify-left"
            >
              {words[currentWordIndex]}
            </motion.span>
          </AnimatePresence>
        </span>
      </motion.button>
    </div>
  )
}
