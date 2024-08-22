'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
    const router = useRouter();

    return (
        <aside className="w-64 bg-gray-100 h-screen flex flex-col p-4 border-r border-gray-200">
            <div className="flex flex-col gap-8">
                <section className="flex flex-col gap-4">
                    <h2 className="text-lg font-semibold text-gray-700">AI Tools</h2>
                    <nav className="flex flex-col gap-2">
                        <Link href="/ai-playground" className={`flex items-center gap-4 p-2 rounded-md hover:bg-blue-100 ${router.pathname === '/ai-playground' ? 'bg-blue-100 text-blue-950' : 'text-gray-700'}`}>
                            <i className="fa-solid fa-flask text-gray-600"></i>
                            <span>AI Playground</span>
                        </Link>
                        <Link href="/chat-pdf" className={`flex items-center gap-4 p-2 rounded-md hover:bg-blue-100 ${router.pathname === '/chat-pdf' ? 'bg-blue-100 text-blue-950' : 'text-gray-700'}`}>
                            <i className="fa-solid fa-file-alt text-gray-600"></i>
                            <span>Chat PDF</span>
                        </Link>
                        <Link href="/image-generator" className={`flex items-center gap-4 p-2 rounded-md hover:bg-blue-100 ${router.pathname === '/image-generator' ? 'bg-blue-100 text-blue-950' : 'text-gray-700'}`}>
                            <i className="fa-solid fa-image text-gray-600"></i>
                            <span>Image Generator</span>
                        </Link>
                    </nav>
                </section>
                <section className="flex flex-col gap-4">
                    <h2 className="text-lg font-semibold text-gray-700">AI Models</h2>
                    <nav className="flex flex-col gap-2">
                        <Link href="/chatgpt-4" className={`flex items-center gap-4 p-2 rounded-md hover:bg-blue-100 ${router.pathname === '/chatgpt-4' ? 'bg-blue-100 text-blue-950' : 'text-gray-700'}`}>
                            <i className="fa-solid fa-brain text-gray-600"></i>
                            <span>ChatGPT-4</span>
                        </Link>
                        <Link href="/claude-opus" className={`flex items-center gap-4 p-2 rounded-md hover:bg-blue-100 ${router.pathname === '/claude-opus' ? 'bg-blue-100 text-blue-950' : 'text-gray-700'}`}>
                            <i className="fa-solid fa-robot text-gray-600"></i>
                            <span>Claude Opus</span>
                        </Link>
                        <Link href="/gemini-1-5-pro" className={`flex items-center gap-4 p-2 rounded-md hover:bg-blue-100 ${router.pathname === '/gemini-1-5-pro' ? 'bg-blue-100 text-blue-950' : 'text-gray-700'}`}>
                            <i className="fa-solid fa-star text-gray-600"></i>
                            <span>Gemini 1.5 Pro</span>
                        </Link>
                        <Link href="/groq" className={`flex items-center gap-4 p-2 rounded-md hover:bg-blue-100 ${router.pathname === '/groq' ? 'bg-blue-100 text-blue-950' : 'text-gray-700'}`}>
                            <i className="fa-solid fa-cube text-gray-600"></i>
                            <span>Groq</span>
                        </Link>
                        <Link href="/llama-3" className={`flex items-center gap-4 p-2 rounded-md hover:bg-blue-100 ${router.pathname === '/llama-3' ? 'bg-blue-100 text-blue-950' : 'text-gray-700'}`}>
                            <i className="fa-solid fa-paw text-gray-600"></i>
                            <span>Llama 3</span>
                        </Link>
                        <Link href="/mistral-large" className={`flex items-center gap-4 p-2 rounded-md hover:bg-blue-100 ${router.pathname === '/mistral-large' ? 'bg-blue-100 text-blue-950' : 'text-gray-700'}`}>
                            <i className="fa-solid fa-wind text-gray-600"></i>
                            <span>Mistral Large</span>
                        </Link>
                    </nav>
                </section>
            </div>
        </aside>
    );
}
