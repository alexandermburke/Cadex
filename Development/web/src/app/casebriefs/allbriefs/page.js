import AllBriefs from '@/components/casebriefs/AllBriefs'
import CoolLayout from '@/components/CoolLayout'
import Main from '@/components/Main'
import React from 'react'

export const metadata = {
    title: "CadexLaw ⋅ All Case Briefs",
    icons: '/favicon.png'
};

export default function ApplicationPage() {
    return (
        <AllBriefs />
    )
}
