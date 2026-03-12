"use client";

import React, { useState, useEffect } from "react";

export default function HeroSection({ portfolio }: { portfolio?: any }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideImages, setSlideImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch hero images from the new API
  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const response = await fetch('/api/hero');
        const result = await response.json();

        if (result.data && result.data.length > 0) {
          // Extract just the image URLs from the returned documents
          setSlideImages(result.data.map((item: { imageUrl: string }) => item.imageUrl));
        } else {
          // Fallback if no hero images exist
          setSlideImages([portfolio?.profileImage || "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2071&auto=format&fit=crop"]);
        }
      } catch (error) {
        console.error("Failed to fetch hero images:", error);
        setSlideImages([portfolio?.profileImage || "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2071&auto=format&fit=crop"]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeroImages();
  }, [portfolio?.profileImage]);

  // Auto-play slides every 5 seconds
  useEffect(() => {
    if (slideImages.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slideImages.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slideImages.length]);

  if (isLoading) {
    return <section className="relative h-screen w-full bg-black animate-pulse" />;
  }

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black flex items-center justify-center">
        {/* Slides */}
        {slideImages.map((src, idx) => (
          <img 
              key={idx}
              src={src} 
              alt={`Slide ${idx + 1}`} 
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                idx === currentIndex ? "opacity-100" : "opacity-0"
              }`}
          />
        ))}

        {/* Overlay gradient to ensure text visibility */}
        <div className="absolute inset-0 bg-black/30 z-10 pointer-events-none" />

        {/* --- NEW: Centered Text Overlay --- */}
        <div className="absolute z-20 flex flex-col items-center justify-center text-center px-4 pointer-events-none w-full max-w-5xl">
    {/* Top cursive text - The Emotional Slogan */}
    <p 
        className="text-white text-3xl md:text-5xl mb-4 font-light tracking-wide drop-shadow-md"
        style={{ fontFamily: "'Great Vibes', 'Dancing Script', 'Brush Script MT', cursive" }}
    >
        Where every moment becomes a legacy
    </p>
    
    {/* Main Title - The Brand Slogan */}
    <h1 className="text-white text-4xl md:text-6xl lg:text-7xl font-serif tracking-widest leading-tight uppercase drop-shadow-lg">
        Capturing <span className="lowercase italic tracking-normal font-serif text-yellow-500">the</span>
        <br />
        Extraordinary Soul
    </h1>

    {/* Optional: Minimal decorative line */}
    <div className="mt-6 w-24 h-[1px] bg-white/40 shadow-xl"></div>
</div>

        {/* Slide Pagination Dots */}
        {slideImages.length > 1 && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-3">
              {slideImages.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`rounded-full transition-all duration-300 ${
                    idx === currentIndex 
                      ? "w-4 h-3 bg-white" 
                      : "w-3 h-3 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
          </div>
        )}
    </section>
  );
}