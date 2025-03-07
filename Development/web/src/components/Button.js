import React from 'react';

export default function Button({ clickHandler, text, sm, icon, saving }) {
    return (
        <button 
            onClick={clickHandler} 
            className={`flex-1 rounded-lg max-w-[300px] mx-auto w-full before:ease relative h-12 overflow-hidden bg-blue-950 text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-[600px] ${
                sm ? ' text-xs sm:text-sm px-2' : ' p-4'
            }`}
        >
            <div className='flex items-center justify-center h-full'>
                {icon && <span className='mr-2'>{icon}</span>}
                <p className='text-center my-auto leading-tight'>{saving || text}</p>
            </div>
        </button>
    );
}
