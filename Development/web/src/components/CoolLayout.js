import React from 'react'
import Header from './Header'
import Footer from './Footer'

export default function CoolLayout(props) {
    const { children } = props
    return (
        <div className='flex flex-col flex-1 bg-gradient-to-tr from-blue-950 to-blue-900'>
            <Header />
            {children}
            <Footer />
        </div>
    )
}
