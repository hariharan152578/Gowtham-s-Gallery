"use client";

import React, { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Heart, Share2, Maximize2, X, Settings } from "lucide-react";
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
  }, []);

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
        // Update local gallery data to show count change
        setGallery(prev => prev.map(item => item._id === id ? { ...item, likes: (item.likes || 0) + 1 } : item));
        
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
          <h2 className="text-4xl md:text-7xl font-serif font-black text-foreground tracking-tight uppercase leading-[0.9] mb-8">
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
                    ? 'md:col-span-2 aspect-[2.8/2]' // Landscape 3:2
                    : 'md:col-span-1 aspect-2/3' // Portrait 2:3
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
            className="fixed inset-0 z-100 flex items-center justify-center bg-zinc-950/98 p-4 md:p-12 backdrop-blur-md"
            onClick={closeLightbox}
          >
            <button className="absolute top-6 right-6 text-white group flex items-center gap-3 z-50">
               <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Close Esc</span>
               <div className="w-12 h-12 border border-white/10 rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                 <X className="w-5 h-5" />
               </div>
            </button>

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
                      <h3 className="text-white text-4xl font-serif font-black uppercase tracking-tighter mt-2 leading-none">
                        {selectedImg.title}
                      </h3>
                    </div>
                    <div className="flex flex-col gap-4">
                        <button 
                            onClick={(e) => handleLike(e, selectedImg._id)}
                            className={`p-3 rounded-full border transition-all ${likedIds.includes(selectedImg._id) ? 'bg-red-500 border-red-500 text-white' : 'border-white/10 text-white hover:bg-white/10'}`}
                        >
                            <Heart className={`w-5 h-5 ${likedIds.includes(selectedImg._id) ? 'fill-current' : ''}`} />
                        </button>
                        <button 
                            onClick={(e) => handleShare(e, selectedImg)}
                            className="p-3 rounded-full border border-white/10 text-white hover:bg-white/10 transition-all"
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10">
                        <span className="text-white text-sm font-bold">{selectedImg.likes || 0} Likes</span>
                    </div>
                </div>

                <div className="h-px w-16 bg-yellow-500/50" />
                <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                  {selectedImg.description || "A visual representation of architectural precision and design."}
                </p>
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