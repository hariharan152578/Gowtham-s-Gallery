"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";

export default function HeroSection({ portfolio }: { portfolio?: any }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allImages, setAllImages] = useState<any[]>([]);
  const [slideData, setSlideData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Handle screen size detection
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Fetch hero images from the new API
  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const response = await fetch('/api/hero');
        const result = await response.json();

        if (result.data && result.data.length > 0) {
          setAllImages(result.data);
        } else {
          // Fallback if no hero images exist
          setSlideData([{ imageUrl: portfolio?.profileImage || "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2071&auto=format&fit=crop", title: "Gowtham Gallary", subtitle: "Capturing the Extraordinary" }]);
        }
      } catch (error) {
        console.error("Failed to fetch hero images:", error);
        setSlideData([{ imageUrl: portfolio?.profileImage || "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2071&auto=format&fit=crop", title: "Gowtham Gallary", subtitle: "Capturing the Extraordinary" }]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeroImages();
  }, [portfolio?.profileImage]);

  // Filter images based on device type
  useEffect(() => {
    if (allImages.length === 0) return;

    const targetDevice = isMobile ? 'mobile' : 'desktop';
    const filtered = allImages.filter((img: any) => (img.device || 'desktop') === targetDevice);

    if (filtered.length > 0) {
      setSlideData(filtered);
    } else {
      // If no images match the specific device, show fallback
      setSlideData([{ imageUrl: portfolio?.profileImage || "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2071&auto=format&fit=crop", title: "Gowtham Gallary", subtitle: "Capturing the Extraordinary" }]);
    }
    setCurrentIndex(0); // Reset index whenever filtering changes
  }, [isMobile, allImages, portfolio?.profileImage]);

  // Auto-play slides every 5 seconds
  useEffect(() => {
    if (slideData.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slideData.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slideData.length]);

  if (isLoading) {
    return <section className="relative h-screen w-full bg-black animate-pulse" />;
  }

  const currentSlide = slideData[currentIndex];

  return (
    <section className="relative h-screen w-full overflow-hidden bg-background flex items-center justify-center">
      {/* Brand Logo & Name */}
      <div className="absolute top-8 left-8 md:top-12 md:left-12 z-30 flex items-center gap-3 group">
        <span className="text-neutral-900 text-3xl md:text-5xl mb-4 font-light tracking-wide drop-shadow-md font-cursive">
          Gowtham's Gallery
        </span>
      </div>

      {/* Slides */}
      {slideData.map((slide, idx) => (
        <img
          key={idx}
          src={slide.imageUrl}
          alt={`Slide ${idx + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === currentIndex ? "opacity-100" : "opacity-0"
            }`}
        />
      ))}

      {/* Overlay gradient to ensure text visibility */}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent z-10 pointer-events-none" />

      {/* --- Dynamic Text Overlay at the Bottom Right --- */}
      <div className="absolute bottom-10 right-1 md:right-16 z-20 flex flex-col items-end text-right px-4 pointer-events-none w-full max-w-5xl">
        {/* Slide Subtitle - The Emotional Slogan */}
        <p
          className="text-white text-xl md:text-3xl mb-3 font-light tracking-wide drop-shadow-md font-cursive"
        >
          {currentSlide?.subtitle || "Where every moment becomes a legacy"}
        </p>

        {/* Slide Title - The Brand Slogan */}
        <h1 className="text-white text-2xl md:text-4xl lg:text-5xl font-serif tracking-widest leading-tight uppercase drop-shadow-lg">
          {currentSlide?.title || "Capturing the Extraordinary"}
        </h1>

        {/* Decorative line */}
        <div className="mt-4 w-16 h-px bg-accent shadow-xl"></div>
      </div>

      {/* Slide Pagination Dots - Moved to Bottom Left for Balance */}
      {slideData.length > 1 && (
        <div className="absolute bottom-20 left-8 md:left-16 z-20 flex gap-3">
          {slideData.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`rounded-full transition-all duration-300 ${idx === currentIndex
                ? "w-4 h-3 bg-accent shadow-[0_0_10px_rgba(202,138,4,0.5)]"
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