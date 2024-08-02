'use client'
import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const CarouselComponent = () => {
    const settings = {
        centerMode: true,
        infinite: true,
        centerPadding: '60px',
        slidesToShow: 1,
        speed: 500,
    };

    return (
        <div className="container mx-auto">
            <Slider {...settings}>
                <div className="p-4">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <h3 className="text-xl font-semibold mb-2">Before Cadex AI</h3>
                        <p className="text-gray-700 text-base">Success Rate: 60%</p>
                    </div>
                </div>
                <div className="p-4">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <h3 className="text-xl font-semibold mb-2">After Cadex AI</h3>
                        <p className="text-gray-700 text-base">Success Rate: 90%</p>
                    </div>
                </div>
                <div className="p-4">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <h3 className="text-xl font-semibold mb-2">Additional Benefits</h3>
                        <p className="text-gray-700 text-base">Enhanced learning and performance</p>
                    </div>
                </div>
            </Slider>
        </div>
    );
};

export default CarouselComponent;
