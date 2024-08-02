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
        autoplay: true,
        autoplaySpeed: 3000,
        dots: true,
    };

    const images = [
        '/asu.png',
        '/uofa.png',
        '/nau.png',
    ];

    return (
        <div className="container mx-auto">
            <Slider {...settings}>
                {images.map((src, index) => (
                    <div key={index} className="p-4">
                        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                            <img src={src} alt={`slide-${index}`} className="carousel-image rounded-lg mx-auto" />
                        </div>
                    </div>
                ))}
            </Slider>
        </div>
    );
};

export default CarouselComponent;
