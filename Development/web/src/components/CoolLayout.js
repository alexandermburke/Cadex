import React from 'react'
import Header from './Header'
import Footer from './Footer'

export default function CoolLayout(props) {
    const { children } = props
    return (
        <div className='flex flex-col flex-1 bg-white w-full'>
            <Header />
            {children}
            <Footer />
        </div>
    )
}
