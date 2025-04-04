'use client';
import React, { useState, useEffect, useRef } from 'react';
import { FaComments, FaTimes, FaStar, FaRegStar, FaCopy } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const messagesContainerRef = useRef(null);

  const toggleChat = () => setIsOpen((prev) => !prev);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input;
    // Immediately clear the text field.
    setInput('');

    // Add the user's message.
    const userMessage = { text: userText, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch('/api/Chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userText }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch legal answer.');
      }

      const data = await response.json();
      const answer = data.answer || 'No answer provided.';
      const source = data.source || 'No source provided.';
      // Bot messages (other than greeting) are savable.
      const botMessage = { answer, source, sender: 'bot', saved: false, nonSavable: false };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error fetching legal answer:', error);
      const errorMsg = {
        text: 'Sorry, an error occurred while fetching the legal answer.',
        sender: 'bot',
        saved: false,
        nonSavable: false,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Tooltip: show every 180 seconds (3 minutes) for 5 seconds when chat is closed.
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isOpen) {
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 5000);
      }
    }, 180000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // When the chat is opened and no messages exist, add a greeting.
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greetingMessage = {
        answer: "Hello, my name is LExAPI. Ask me any law school related questions.",
        source: "",
        sender: "bot",
        saved: false,
        nonSavable: true,
      };
      setMessages([greetingMessage]);
    }
  }, [isOpen]);

  // Auto-scroll to bottom when messages update.
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Persist saved messages in localStorage.
  useEffect(() => {
    const savedMessages = messages.filter(
      (msg) => msg.sender === 'bot' && msg.saved && !msg.nonSavable
    );
    localStorage.setItem('LExAPI_savedMessages', JSON.stringify(savedMessages));
  }, [messages]);

  // Toggle saved status for a bot message.
  const toggleSave = (index) => {
    setMessages((prev) => {
      const newMessages = [...prev];
      const msg = newMessages[index];
      if (msg.sender === 'bot' && !msg.nonSavable) {
        newMessages[index] = { ...msg, saved: !msg.saved };
      }
      return newMessages;
    });
  };

  // Handle copying message answer text to clipboard.
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    console.log("Copied: " + text);
  };

  return (
    <div>
      {/* Tooltip above the chat button */}
      <AnimatePresence>
        {showTooltip && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.5 }}
            className="fixed bottom-16 right-4 bg-white text-blue-600 text-sm px-3 py-2 rounded shadow-lg z-50"
          >
            Need assistance? Click to chat.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat modal */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-20 right-4 w-96 max-w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-2xl shadow-2xl p-6 z-50 overflow-y-auto"
          style={{ maxHeight: '70vh' }}
        >
          <div className="flex flex-col mb-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-lg text-blue-950 dark:text-white">
                LExAPI 3.0 Chatbot
              </h4>
              <button onClick={toggleChat}>
                <FaTimes className="text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <p className="text-gray-500 italic text-xs mt-1">
              still in testing, use at your own risk.
            </p>
          </div>

          {/* Messages container */}
          <div ref={messagesContainerRef} className="space-y-3 mb-4 max-h-80 overflow-y-auto">
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: msg.sender === 'user' ? 40 : -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'user' ? (
                  <span className="inline-block px-3 py-2 rounded-xl max-w-xs whitespace-pre-wrap break-words bg-blue-500 text-white">
                    {msg.text}
                  </span>
                ) : (
                  <div className="max-w-xs relative">
                    {/* The bubble */}
                    <div className="inline-block w-full px-3 py-2 rounded-xl whitespace-pre-wrap break-words bg-gray-300 text-black pr-10 pb-8">
                      <p>{msg.answer || msg.text}</p>
                      {msg.source && (
                        <ul className="list-disc pl-5 mt-2 text-sm text-blue-700">
                          {msg.source.split('\n').map((src, idx) => {
                            const trimmedSrc = src.trim();
                            if (!trimmedSrc) return null;
                            const isURL = trimmedSrc.startsWith('http://') || trimmedSrc.startsWith('https://');
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
                            );
                          })}
                        </ul>
                      )}
                    </div>
                    {/* Icon buttons pinned to bottom-right */}
                    {!msg.nonSavable && (
                      <div className="absolute bottom-2 right-2 flex space-x-2">
                        <motion.span onClick={() => toggleSave(index)} whileTap={{ scale: 0.8 }} className="cursor-pointer">
                          {msg.saved ? <FaStar className="text-yellow-400" size={18} /> : <FaRegStar className="text-gray-400" size={18} />}
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
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex justify-start"
              >
                <span className="inline-block px-3 py-2 rounded-xl bg-gray-200 text-gray-600">
                  Sending...
                </span>
              </motion.div>
            )}
          </div>

          {/* Input field and send button */}
          <div className="flex">
            <input
              type="text"
              className="flex-1 border border-gray-300 dark:border-gray-700 rounded-l-xl p-2 focus:outline-none"
              placeholder="Ask your law school questions..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={loading}
            />
            <button onClick={handleSend} className="bg-blue-600 text-white px-4 py-2 rounded-r-xl" disabled={loading}>
              Send
            </button>
          </div>
        </motion.div>
      )}

      {/* Toggle chat button */}
      <motion.button
        onClick={toggleChat}
        initial={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        className="fixed bottom-4 right-4 bg-blue-600 text-white rounded-lg px-5 py-3 shadow-lg z-50 flex items-center space-x-2"
      >
        <FaComments />
        <span>LExAPI Chatbot</span>
      </motion.button>
    </div>
  );
}
