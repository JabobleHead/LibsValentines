import React, { useState, useEffect } from 'react';
import './PhotoSlideShow.css';

interface Photo {
  src: string;
  caption: string;
}

interface PhotoSlideshowProps {
  photos: Photo[];
  autoPlayInterval?: number;
}

const PhotoSlideshow: React.FC<PhotoSlideshowProps> = ({ 
  photos, 
  autoPlayInterval = 5000 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === photos.length - 1 ? 0 : prevIndex + 1
      );
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isAutoPlaying, photos.length, autoPlayInterval]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? photos.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prevIndex) => 
      prevIndex === photos.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  return (
    <div className="slideshow-container">
      <h2 className="slideshow-title">Our Favorite Memories 📸</h2>
      <p className="slideshow-subtitle">Every moment with you is special 💖</p>
      
      <div className="slideshow-wrapper">
        <button 
          className="nav-button prev-button" 
          onClick={goToPrevious}
          aria-label="Previous photo"
        >
          ❮
        </button>

        <div className="slide-content">
          <div className="image-container">
            <img
              src={photos[currentIndex].src}
              alt={photos[currentIndex].caption}
              className="slide-image"
            />
          </div>
          <div className="caption-container">
            <p className="caption-text">{photos[currentIndex].caption}</p>
          </div>
        </div>

        <button 
          className="nav-button next-button" 
          onClick={goToNext}
          aria-label="Next photo"
        >
          ❯
        </button>
      </div>

      <div className="dots-container">
        {photos.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <p className="slide-counter">
        {currentIndex + 1} / {photos.length}
      </p>
    </div>
  );
};

export default PhotoSlideshow;