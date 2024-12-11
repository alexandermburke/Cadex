import React from 'react'

export default function Main(props) {
    const { children } = props
    return (
        <main className="flex max-w-full sm:gap-14 min-h-screen md:gap-20 mx-auto w-full flex-1 flex-col py-20">
            {children}

        </main>
    )
}
