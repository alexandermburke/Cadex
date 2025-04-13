import CaseSummaries from '@/components/casebriefs/CaseSummaries'
import CoolLayout from '@/components/CoolLayout'
import Main from '@/components/Main'
import React from 'react'

export const metadata = {
    title: "CadexLaw ⋅ Case Summary",
    icons: '/favicon.png'
};

export default function ApplicationPage() {
    return (
        <CaseSummaries />
    )
}
