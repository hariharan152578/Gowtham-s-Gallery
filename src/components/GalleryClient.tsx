"use client";

import React, { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Heart, Share2, Maximize2, X, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import HeroSection from "./HeroSection";
import ProfileSection from "./ProfileSection";
import { toast } from "react-hot-toast";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function GalleryClient({ portfolio, gallery: initialGallery }: { portfolio: any, gallery: any[] }) {
  const containerRef = useRef(null);
  const [gallery, setGallery] = useState(initialGallery);
  const [selectedImg, setSelectedImg] = useState<any>(null);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [showHeartPop, setShowHeartPop] = useState<string | null>(null);

  // Initialize likes from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem("gowtham_gallery_likes");
    if (saved) setLikedIds(JSON.parse(saved));
    
    // Fetch latest gallery data on mount to get up-to-date likes/info
    const fetchLatest = async () => {
      try {
        const res = await fetch("/api/gallery");
        const json = await res.json();
        if (res.ok && json.data) {
          setGallery(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch fresh gallery data", err);
      }
    };
    fetchLatest();
  }, []);

  // Handle Keyboard Navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImg) return;
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImg, gallery]);

  const handleNext = () => {
    if (!selectedImg || !gallery) return;
    const currentIndex = gallery.findIndex(item => item._id === selectedImg._id);
    const nextIndex = (currentIndex + 1) % gallery.length;
    setSelectedImg(gallery[nextIndex]);
  };

  const handlePrev = () => {
    if (!selectedImg || !gallery) return;
    const currentIndex = gallery.findIndex(item => item._id === selectedImg._id);
    const prevIndex = (currentIndex - 1 + gallery.length) % gallery.length;
    setSelectedImg(gallery[prevIndex]);
  };

  const handleLike = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (likedIds.includes(id)) return;

    try {
      const res = await fetch(`/api/gallery/${id}/like`, { method: "PATCH" });
      if (res.ok) {
        const data = await res.json();
        setLikedIds(prev => {
          const next = [...prev, id];
          localStorage.setItem("gowtham_gallery_likes", JSON.stringify(next));
          return next;
        });
        // Update local gallery data to show count change from server
        setGallery(prev => prev.map(item => item._id === id ? { ...item, likes: data.likes } : item));
        
        // If the liked image is open in lightbox, update it too
        if (selectedImg?._id === id) {
          setSelectedImg((prev: any) => ({ ...prev, likes: (prev.likes || 0) + 1 }));
        }
        
        setShowHeartPop(id);
        setTimeout(() => setShowHeartPop(null), 1000);
      }
    } catch (err) {
      console.error("Like failed", err);
    }
  };

  const handleShare = async (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    const shareData = {
      title: item.title,
      text: item.description || "Check out this photography work by Gowtham",
      url: window.location.href, // Ideally a specific image URL if you had routes for them
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Share failed", err);
    }
  };

  const handleDoubleTap = (e: React.MouseEvent, id: string) => {
    handleLike(e, id);
  };

  useGSAP(() => {
    ScrollTrigger.refresh();

    // Entrance Animation for Header
    gsap.from(".gallery-header > *", {
      y: 60,
      opacity: 0,
      stagger: 0.15,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".gallery-header",
        start: "top 85%"
      }
    });

    // Staggered Entrance for Items
    const items = gsap.utils.toArray(".gallery-item");
    gsap.fromTo(items, 
      { y: 50, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 1, 
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".gallery-grid",
          start: "top 80%",
        }
      }
    );

    // Subtle Parallax for Images
    items.forEach((item: any) => {
      const img = item.querySelector("img");
      gsap.to(img, {
        yPercent: 8,
        ease: "none",
        scrollTrigger: {
          trigger: item,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    });
  }, { scope: containerRef, dependencies: [gallery] });

  const closeLightbox = () => setSelectedImg(null);

  return (
    <section ref={containerRef} className="bg-background min-h-screen relative text-foreground selection:bg-accent selection:text-white font-sans">
      <HeroSection portfolio={portfolio} />

      <div className="max-w-7xl mx-auto py-32 px-6 md:px-12">
        {/* Header Section */}
        <div className="gallery-header max-w-3xl mb-24">
          <h1 className="text-[11px] font-bold text-accent-2 uppercase tracking-[0.5em] mb-6 block font-sans">Visual Record</h1>
          <h2 className="text-3xl md:text-5xl font-serif font-black text-foreground tracking-tight uppercase leading-[0.9] mb-8">
            The Gowtham 's <br /> <span className="text-zinc-300 dark:text-zinc-800">Gallery</span>
          </h2>
        </div>

        {/* Improved Masonry Grid */}
        {gallery?.length > 0 ? (
          <div className="gallery-grid grid grid-cols-3 md:grid-cols-3 gap-4 md:gap-8 items-start">
            {gallery.map((item: any) => (
              <div 
                key={item._id}
                onClick={() => setSelectedImg(item)}
                onDoubleClick={(e) => handleDoubleTap(e, item._id)}
                className={`gallery-item group relative overflow-hidden bg-zinc-100 cursor-pointer transition-all duration-500 rounded-sm
                  ${item.size === 'large' || item.size === 'medium' 
                    ? 'col-span-2 aspect-[2.8/2]' // Landscape 3:2
                    : 'col-span-1 aspect-2/3' // Portrait 2:3
                  }
                `}
              >
                {/* Image Container */}
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                      className="w-full h-[112%] object-cover absolute top-[-6%] left-0 transition-transform duration-1000 group-hover:scale-110"
                    />
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-zinc-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-accent text-[10px] font-bold uppercase tracking-widest block font-sans">
                          {item.category || "General"}
                        </span>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={(e) => handleLike(e, item._id)}
                                className={`flex items-center gap-1 transition-colors ${likedIds.includes(item._id) ? 'text-red-500' : 'text-white/70 hover:text-white'}`}
                            >
                                <Heart className={`w-4 h-4 ${likedIds.includes(item._id) ? 'fill-current' : ''}`} />
                                <span className="text-[10px] font-bold">{item.likes || 0}</span>
                            </button>
                            <button 
                                onClick={(e) => handleShare(e, item)}
                                className="text-white/70 hover:text-white transition-colors"
                            >
                                <Share2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <h4 className="text-white text-xl font-serif font-bold uppercase tracking-tight leading-tight">
                      {item.title}
                    </h4>
                    <div className="mt-3 flex items-center gap-2 text-white/60">
                        <Maximize2 className="w-3 h-3" />
                        <span className="text-[8px] font-bold uppercase tracking-widest">Open View</span>
                    </div>
                  </div>
                </div>

                {/* Heart Pop Animation */}
                <AnimatePresence>
                  {showHeartPop === item._id && (
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1.5, opacity: 1 }}
                      exit={{ scale: 2, opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                    >
                      <Heart className="w-20 h-20 text-red-500 fill-current drop-shadow-2xl" />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Hover Frame Effect */}
                <div className="absolute inset-0 border-0 group-hover:border border-white/20 transition-all duration-500 pointer-events-none" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-500 font-medium">
             <p className="text-xl">Portfolio is currently empty.</p>
          </div>
        )}
        <div className="mt-32 border-t border-stone-200 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
      <ProfileSection portfolio={portfolio} />
        </div>
        {/* <div className="mt-32 border-t border-stone-200 pt-12 flex flex-col md:flex-row justify-between items-center gap-8"> */}

          <a href="https://portfolio-152578.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-stone-400 font-mono text-[10px] uppercase tracking-widest">
            © {new Date().getFullYear()} BUILD By Hariharan Marudasamy  |All rights reserved |for contact information click here.
          </a>
        {/* </div> */}
      </div>

      {/* LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-white/98 p-4 md:p-12 backdrop-blur-xl"
            onClick={closeLightbox}
          >
            <button 
              className="absolute top-6 right-6 text-zinc-900 group flex items-center gap-3 z-50 p-2"
              onClick={closeLightbox}
            >
               <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Close Esc</span>
               <div className="w-12 h-12 border border-zinc-200 rounded-full flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-all shadow-sm">
                 <X className="w-5 h-5" />
               </div>
            </button>

            {/* Navigation Buttons */}
            <div className="absolute inset-x-2 md:inset-x-12 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-40">
              <button 
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                className="md:w-14 md:h-14 w-10 h-10 rounded-full bg-white/80 border border-zinc-200 flex items-center justify-center text-zinc-900 hover:bg-zinc-900 hover:text-white transition-all pointer-events-auto shadow-xl group active:scale-95"
                title="Previous"
              >
                <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="md:w-14 md:h-14 w-10 h-10 rounded-full bg-white/80 border border-zinc-200 flex items-center justify-center text-zinc-900 hover:bg-zinc-900 hover:text-white transition-all pointer-events-auto shadow-xl group active:scale-95"
                title="Next"
              >
                <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-7xl w-full h-full flex flex-col md:flex-row items-center justify-center gap-12"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-1 w-full h-full max-h-[60vh] md:max-h-[85vh] flex items-center justify-center">
                <img 
                  src={selectedImg.imageUrl} 
                  alt={selectedImg.title} 
                  className="max-w-full max-h-full object-contain shadow-2xl"
                />
              </div>

              <div className="w-full md:w-[350px] text-left space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                      <span className="text-accent text-xs font-bold uppercase tracking-[0.4em] font-sans">
                        {selectedImg.category || "Project"}
                      </span>
                      <h3 className="text-zinc-900 text-2xl font-serif font-black uppercase tracking-tighter mt-2 leading-none">
                        {selectedImg.title}
                      </h3>
                       <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-sans">Project Detail</h4>
                  <p className="text-zinc-600 text-base leading-relaxed font-medium">
                    {selectedImg.description && selectedImg.description.trim() !== "" 
                      ? selectedImg.description 
                      : "A visual record of architectural precision and design aesthetics by Gowtham."}
                  </p>
                </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleLike(e, selectedImg._id); }}
                            className={`p-3 rounded-full border relative transition-all shadow-sm ${likedIds.includes(selectedImg._id) ? 'bg-red-500 border-red-500 text-white' : 'border-zinc-200 text-zinc-900 hover:bg-zinc-100'}`}
                        >
                            <span className="text-[10px] font-bold absolute top-0 right-0 mt-0 mr-0 bg-black px-1 rounded-full text-white uppercase tracking-widest z-10 font-sans">{selectedImg.likes || 0}</span>
                            <Heart className={`w-5 h-5 ${likedIds.includes(selectedImg._id) ? 'fill-current' : ''}`} />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleShare(e, selectedImg); }}
                            className="p-3 rounded-full border border-zinc-200 text-zinc-900 hover:bg-zinc-100 transition-all shadow-sm"
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                
                <div className="h-px w-24 bg-zinc-900/10" />
               
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Link href="/admin/login" className="fixed bottom-8 left-8 p-3 rounded-full bg-white border border-stone-200 text-stone-400 hover:text-black hover:border-zinc-400 shadow-xl transition-all duration-300 hover:rotate-90 z-50">
          <Settings className="w-5 h-5" />
      </Link>
      
    </section>
  );
}