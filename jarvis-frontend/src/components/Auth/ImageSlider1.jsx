import React, { useState, useEffect } from "react";
// Import the CSS for the slider
import './ImageSlider1.css'; 

const ImageSlider1 = () => {
  // --- Pinterest Images ---
  // Replace these URLs with the specific image links you find on Pinterest.
  // Ensure they are direct image links (usually ending in .jpg or .png).
  const images = [
    "https://i.pinimg.com/736x/d0/4e/18/d04e1841c00ed2772a61c847768319c2.jpg", // Replace with your 1st Pinterest image link
    "https://i.pinimg.com/736x/2d/73/28/2d73288e277e41b26ff3a6442c999a8b.jpg", // Replace with your 2nd Pinterest image link
    "https://i.pinimg.com/736x/2d/0c/97/2d0c972d4064cd2eb0bbb4c933613057.jpg", // Replace with your 3rd Pinterest image link
    "https://i.pinimg.com/736x/a3/5f/4e/a35f4e608ba8a0af93020c3ed7966f70.jpg",
    "https://i.pinimg.com/1200x/89/3c/d6/893cd6b415deac2b815fd70b1445be82.jpg"  // Replace with your 4th Pinterest image link
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // --- Auto-play Logic ---
    const intervalId = setInterval(() => {
      // Loop back to the first image after the last one
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000); // Change image every 4 seconds

    // Clean up the interval on component unmount to prevent memory leaks
    return () => clearInterval(intervalId);
  }, [images.length]); // Re-run effect if the number of images changes

  // Optional: Function to manually go to the next slide
  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  // Optional: Function to manually go to the previous slide
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      // Handle the wrapping when going backwards from the first image
      (prevIndex - 1 + images.length) % images.length
    );
  };

  return (
    <div className="slider-container">
      {/* --- Image Display --- */}
      <img 
        src={images[currentIndex]} 
        alt={`Pinterest Slide ${currentIndex + 1}`} 
        className="slider-image"
      />
      
      {/* --- Navigation Buttons (Optional) --- */}
      {/* Uncomment if you want clickable navigation */}
      {/* <button onClick={goToPrevious} className="slider-btn prev">Prev</button>
      <button onClick={goToNext} className="slider-btn next">Next</button> 
      */}

      {/* --- Slide Indicators (Optional) --- */}
      {/* Uncomment if you want dots to show the current slide */}
      {/* <div className="indicators">
        {images.map((_, index) => (
          <span 
            key={index} 
            className={`indicator ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div> 
      */}
    </div>
  );
};

export default ImageSlider1;