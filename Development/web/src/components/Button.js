import React from 'react'

export default function Button(props) {
    const { clickHandler, text, sm, icon, saving } = props
    return (
        <button onClick={clickHandler} className='flex-1 bg-white rounded max-w-[600px] mx-auto w-full before:ease relative h-12 overflow-hidden bg-gradient-to-r from-blue-950 to-slate-700 text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-[600px]'>
            <div className={' hover:text-white ' + (sm ? ' h-full text-xs sm:text-sm px-2' : ' p-4')}>
                {icon}
                <p className={'text-center my-auto leading-tight '}>{saving || text}</p>
            </div>
        </button>
    )
}
