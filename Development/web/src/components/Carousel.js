'use client'
import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const CarouselComponent = () => {
    const settings = {
        centerMode: true,
        infinite: true,
        centerPadding: '0px', // Adjust this to remove the padding causing overflow
        slidesToShow: 1,
        speed: 500,
        autoplay: true,
        autoplaySpeed: 2000,
        dots: false,
        arrows: false,
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
                        <div className="bg-transparent p-6 rounded text-center">
                            <img 
                                src={src} 
                                alt={`slide-${index}`} 
                                className="carousel-image rounded-lg mx-auto max-w-full h-auto" 
                                style={{maxHeight: '300px', objectFit: 'contain'}}
                            />
                        </div>
                    </div>
                ))}
            </Slider>
        </div>
    );
};

export default CarouselComponent;
