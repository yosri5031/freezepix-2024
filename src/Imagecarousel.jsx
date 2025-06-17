import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import print1 from './assets/wedding.jpg';
import print2 from './assets/baby.jpg';
import print3 from './assets/omra.jpg';
import print4 from './assets/print4.jpg';
import print5 from './assets/print5.jpg';
import print6 from './assets/print6.jpg';

import print11 from './assets/print11.jpg';
import print12 from './assets/print12.jpg';
import print13 from './assets/print13.jpg';

import usprint1 from './assets/usprint1.jpg';
import usprint2 from './assets/usprint2.jpg';
import usprint3 from './assets/usprint3.jpg';

const ImageCarousel = ({ selectedCountry }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const getImagesForCountry = () => {
    if (selectedCountry === 'US') {
      return [
        {
          id: 1,
          src: usprint1,
          alt: 'Professional Photo Printing US',
        },
        {
          id: 2,
          src: usprint2,
          alt: 'Photo Studio US',
        },
        {
          id: 3,
          src: usprint3,
          alt: 'Delivered Prints US',
        }
      ];
    } else if (selectedCountry === 'CA') {
      return [
        {
          id: 1,
          src: print11,
          alt: 'Professional Photo Printing CA',
        },
        {
          id: 2,
          src: print12,
          alt: 'Photo Studio CA',
        },
        {
          id: 3,
          src: print13,
          alt: 'Delivered Prints CA',
        }
      ];
    } else {
      return [
        {
          id: 1,
          src: print1,
          alt: 'Professional Photo Printing',
        },
        {
          id: 2,
          src: print2,
          alt: 'Photo Studio',
        },
        {
          id: 3,
          src: print3,
          alt: 'Delivered Prints',
        },
        {
          id: 4,
          src: print4,
        },
        {
          id: 5,
          src: print5,
        },
        {
          id: 6,
          src: print6,
        }
      ];
    }
  };

  const images = getImagesForCountry();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = (e) => {
    e.preventDefault();
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = (e) => {
    e.preventDefault();
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="relative w-full h-64 md:h-96 lg:h-[32rem] overflow-hidden rounded-lg">
      <div 
        className="absolute top-0 left-0 w-full h-full flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div
            key={image.id}
            className="w-full h-full flex-shrink-0 relative"
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <h3 className="absolute bottom-8 left-1/2 -translate-x-1/2 text-2xl font-bold text-white text-center w-full px-4">
              {image.title}
            </h3>
          </div>
        ))}
      </div>

      <button
        onClick={goToPrevious}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
      >
        <ChevronRight size={20} />
      </button>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;