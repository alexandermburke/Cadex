'use client'
import React from 'react';

export default function GraphicDisplay(props) {
    const { real } = props;

    return (
        <div className={"flex flex-col dropShadow overflow-hidden rounded-b-lg w-full mx-auto " + (real ? ' max-w-[1200px]' : ' max-w-[500px]')}>
            <div className={"rounded-t-xl p-4 bg-white opacity-60 flex items-center gap-2 "}>
                {[1, 2, 3].map((val, i) => (
                    <div key={i} className={"rounded-full aspect-square bg-indigo-300 " + (real ? ' w-3 sm:w-3.5 ' : ' w-.5 sm:w-3')} />
                ))}
                <p className={'text-xl text-slate-500 pl-2 ' + (real ? ' text-base sm:text-lg font-light ' : ' text-xs sm:text-sm')}>Youtube</p>
            </div>
            <div className={"flex bg-white flex-1 overflow-hidden relative"}>
                <div className="flex justify-center items-center w-full h-full">
                <iframe
    width="100%"
    height="500px"
    src="https://www.youtube.com/embed/QYrrCNVTDKY" 
    title="YouTube video player"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
></iframe>

                </div>
            </div>
        </div>
    );
}
