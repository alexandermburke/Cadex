import CaseAnalysis from '@/components/casebriefs/CaseAnalysis'
import CoolLayout from '@/components/CoolLayout'
import Main from '@/components/Main'
import React from 'react'

export const metadata = {
    title: "CadexLaw ⋅ Case Brief Analysis",
    icons: '/favicon.png'
};

export default function ApplicationPage() {
    return (
        <CaseAnalysis />
    )
}
