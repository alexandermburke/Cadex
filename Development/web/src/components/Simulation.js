'use client';
import React, { useState } from 'react';
import { ChatGPTAPI } from 'openai'; // Assuming you have the API configured
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Simulation() {
    const [chatHistory, setChatHistory] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSend = async () => {
        if (!userInput.trim()) return;

        const userMessage = { role: 'user', content: userInput };
        const updatedChatHistory = [...chatHistory, userMessage];

        setChatHistory(updatedChatHistory);
        setUserInput('');
        setIsLoading(true);

        try {
            const response = await ChatGPTAPI({
                model: "gpt-3.5-turbo",
                messages: updatedChatHistory,
            });

            const aiMessage = { role: 'assistant', content: response.data.choices[0].message.content };
            setChatHistory([...updatedChatHistory, aiMessage]);

            // Save chat history function should be here (if implemented)
        } catch (error) {
            console.error("Error fetching response from ChatGPT API:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveCase = async () => {
        setIsLoading(true);
    
        try {
            const currData = localStorage.getItem('cases') ? JSON.parse(localStorage.getItem('cases')) : {};
            const newCase = {
                [caseMeta.id]: {
                    caseMeta: { ...caseMeta, attachments: attachmentPostings, dateCreated: new Date().toISOString() }, // Save the current date
                    feedback: caseMeta.feedback
                }
            };
    
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                cases: {
                    ...(currData.cases || {}),
                    ...newCase
                }
            });
    
            const casesRef = doc(db, 'cases', caseMeta.id);
            await setDoc(casesRef, newCase);
    
            const newData = { ...currData, cases: { ...(currData.cases || {}), ...newCase } };
            localStorage.setItem('cases', JSON.stringify(newData));
            setUserDataObj(curr => ({ ...curr, cases: newData.cases }));

            // Redirect to simulation page
            router.push('/admin/simulation');
        } catch (err) {
            console.error('Failed to save data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center h-screen bg-white text-blue-950">
            <header className="flex items-center justify-between w-full p-4 bg-white">
                <button
                    onClick={() => router.back()}
                    className='flex items-center justify-center gap-4 bg-white px-4 py-2 rounded-full text-blue-950 duration-200 hover:opacity-50'
                >
                    <p className=''>&larr; Back</p>
                </button>
                <button
                    onClick={handleSaveCase}
                    className='flex items-center justify-center gap-2 border border-solid border-white bg-slate-50 px-3 py-2 rounded-full text-blue-950 duration-200 hover:opacity-50'
                >
                    <p className=''>{isLoading ? 'Saving' : 'Save'}</p>
                    <i className="fa-solid fa-floppy-disk"></i>
                </button>
            </header>
            <main className="flex-1 w-full max-w-4xl p-4 bg-white rounded-lg shadow-md">
                <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-scroll bg-gray-100 p-4 rounded-md">
                        {chatHistory.map((msg, index) => (
                            <div key={index} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                <p className={`inline-block p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}>
                                    {msg.content}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex items-center">
                        <input
                            type="text"
                            className="flex-1 p-2 border border-gray-300 rounded-md"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Enter your response as an attorney..."
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSend}
                            className="ml-4 p-2 bg-blue-500 text-white rounded-md"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Loading...' : 'Send'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
