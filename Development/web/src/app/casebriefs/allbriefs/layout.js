'use client'
import CoolLayout from '@/components/CoolLayout'
import MainTool from '@/components/MainTool'
import Chatbot from '@/components/Chatbot'
import { useAuth } from '@/context/AuthContext'
import React from 'react'

export default function SubLayout({ children }) {
  const { loading } = useAuth()

  if (loading) {
    return (
      <CoolLayout>
        <MainTool>
          <div className="flex items-center justify-center flex-col flex-1">
            <i className="fa-solid fa-spinner text-white animate-spin text-4xl sm:text-5xl md:text-6xl"></i>
          </div>
        </MainTool>
        <Chatbot />
      </CoolLayout>
    )
  }

  return (
    <CoolLayout>
      <MainTool>
        {children}
      </MainTool>
      <Chatbot />
    </CoolLayout>
  )
}
