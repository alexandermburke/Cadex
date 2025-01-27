"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { FaBars, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "../Sidebar";

/**
 * AIInterviewPrep (JavaScript version)
 * -----------------------------------------------------
 * A completely re-imagined AI-driven Interview Prep
 * component for law students. This version features:
 *  - Quick scenario selection (e.g. BigLaw, Public Interest)
 *  - Interactive Q&A "chat" with an AI interviewer
 *  - Real-time response area with placeholders for feedback
 *
 * NOTE: This component expects you to have an API endpoint
 * or similar method to handle AI chat calls. The code here
 * simply demonstrates client-side UI/UX for an AI-based
 * interactive interview simulation. Replace the fake API
 * calls with your own logic or serverless route.
 */

export default function AIInterviewPrep() {
  const router = useRouter();
  const { currentUser, userDataObj } = useAuth();

  // Determine if user has enabled dark mode
  const isDarkMode = userDataObj?.darkMode || false;

  // Sidebar visibility
  const [showSidebar, setShowSidebar] = useState(true);
  const toggleSidebar = () => setShowSidebar((prev) => !prev);

  // Scenario selection
  // Removed TypeScript union type for scenarios to avoid syntax errors in .js
  const [selectedScenario, setSelectedScenario] = useState("BigLaw");

  // Chat messages
  // Removed TypeScript type annotations
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I’m your AI interviewer. Let’s begin. Tell me about your background and why you chose law as a career.",
    },
  ]);

  // Current user input
  const [userInput, setUserInput] = useState("");
  const inputRef = useRef(null);

  // Early return if user not authenticated
  if (!currentUser) {
    return (
      <div
        className={clsx(
          "flex items-center justify-center h-screen transition-colors",
          isDarkMode ? "bg-slate-900 text-white" : "bg-gray-200 text-gray-800"
        )}
      >
        <div
          className={clsx(
            "p-6 rounded-2xl shadow-xl text-center",
            isDarkMode ? "bg-slate-800" : "bg-white"
          )}
        >
          <p className="mb-4 text-lg font-semibold">
            Please log in to access our AI Interview Prep.
          </p>
          <button
            onClick={() => router.push("/login")}
            className={clsx(
              "px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-300",
              isDarkMode
                ? "bg-blue-600 hover:bg-blue-500 text-white"
                : "bg-blue-950 hover:bg-blue-800 text-white"
            )}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  /**
   * Mock function to simulate sending user input to an AI interviewer.
   * In a real app, you’d call your AI API route here (e.g., using fetch).
   */
  const sendMessageToAI = async (input) => {
    // Add user message
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);

    // Simulate AI typing...
    // You’d normally do something like:
    // const response = await fetch("/api/ai", { method: "POST", body: JSON.stringify({ prompt: newMessages }) });
    // const data = await response.json();
    // Then set the messages with the new AI response.

    setTimeout(() => {
      const aiReply = {
        role: "assistant",
        content: `Thanks for sharing. (Pretend AI interview for scenario: ${selectedScenario})
Please elaborate on a challenge you overcame and how it shaped your legal perspective.`,
      };

      setMessages([...newMessages, aiReply]);
    }, 800);
  };

  // Handle user input submission
  const handleSend = () => {
    if (!userInput.trim()) return;
    sendMessageToAI(userInput.trim());
    setUserInput("");

    // Refocus input field
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div
      className={clsx(
        "flex h-screen w-full transition-colors duration-500",
        isDarkMode ? "text-white bg-slate-900" : "text-gray-800 bg-gray-100"
      )}
    >
      {/* SIDEBAR */}
      <AnimatePresence>
        {showSidebar && (
          <>
            <Sidebar
              activeLink="/lawtools/interviewprep"
              isSidebarVisible={showSidebar}
              toggleSidebar={toggleSidebar}
              isDarkMode={isDarkMode}
            />
            {/* Mobile Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
            />
          </>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <main className="relative flex-1 flex flex-col overflow-hidden">
        {/* Top Bar for Mobile Toggle */}
        <div className="flex items-center justify-between p-3 md:hidden">
          <button
            onClick={toggleSidebar}
            className={clsx(
              "p-2 rounded transition-colors hover:bg-black/10 focus:outline-none"
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              {showSidebar ? (
                <motion.div
                  key="close"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                >
                  <FaTimes size={20} />
                </motion.div>
              ) : (
                <motion.div
                  key="bars"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                >
                  <FaBars size={20} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Interview Container */}
        <div
          className={clsx(
            "flex flex-col h-full p-4 overflow-y-auto",
            isDarkMode ? "bg-slate-800" : "bg-white",
            "md:rounded-md md:shadow-lg"
          )}
        >
          <h1 className="text-2xl font-bold mb-4">
            AI-Powered Law Interview Prep
          </h1>

          {/* SCENARIO SELECTION */}
          <div className="mb-4 flex flex-wrap items-center space-x-2">
            <label className="mr-2 font-semibold">Select Scenario:</label>
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className={clsx(
                "px-3 py-1 rounded border focus:outline-none",
                isDarkMode
                  ? "border-slate-600 bg-slate-700 text-white"
                  : "border-gray-300 bg-white text-gray-800"
              )}
            >
              <option value="BigLaw">BigLaw</option>
              <option value="Public Interest">Public Interest</option>
              <option value="Govt">Government</option>
              <option value="Clerkship">Judicial Clerkship</option>
            </select>
          </div>

          {/* MESSAGES AREA */}
          <div className="flex-1 mb-4 overflow-y-auto rounded border p-3 space-y-3">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={clsx(
                  "rounded p-2 whitespace-pre-wrap break-words",
                  msg.role === "assistant"
                    ? isDarkMode
                      ? "bg-slate-700 text-white self-start"
                      : "bg-gray-100 text-gray-800"
                    : isDarkMode
                    ? "bg-blue-900 text-white self-end"
                    : "bg-blue-50 text-blue-900 self-end",
                  "max-w-[80%]"
                )}
                style={{
                  alignSelf:
                    msg.role === "assistant" ? "flex-start" : "flex-end",
                }}
              >
                {msg.content}
              </div>
            ))}
          </div>

          {/* INPUT AREA */}
          <div className="flex items-center space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              placeholder="Type your response..."
              className={clsx(
                "flex-1 px-3 py-2 rounded-md focus:outline-none",
                isDarkMode
                  ? "bg-slate-700 border-slate-600 text-white"
                  : "bg-white border-gray-300 text-gray-800",
                "border"
              )}
            />
            <button
              onClick={handleSend}
              className={clsx(
                "px-4 py-2 rounded-md font-semibold",
                isDarkMode
                  ? "bg-blue-600 hover:bg-blue-500 text-white"
                  : "bg-blue-900 hover:bg-blue-800 text-white"
              )}
            >
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
