"use client";

import React, { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Settings, Maximize2, X } from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import HeroSection from "./HeroSection";
import ProfileSection from "./ProfileSection";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function GalleryClient({ portfolio, gallery }: { portfolio: any, gallery: any[] }) {
  const containerRef = useRef(null);
  const lightboxRef = useRef(null);
  const [selectedImg, setSelectedImg] = useState<any>(null);

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
    <section ref={containerRef} className="bg-stone-50 min-h-screen relative text-zinc-900 selection:bg-yellow-500 selection:text-black font-sans">
      <HeroSection portfolio={portfolio} />
      <ProfileSection portfolio={portfolio} />

      <div className="max-w-7xl mx-auto py-32 px-6 md:px-12">
        {/* Header Section */}
        <div className="gallery-header max-w-3xl mb-24">
          <h1 className="text-[10px] font-black text-yellow-600 uppercase tracking-[0.6em] mb-6 block">Visual Record</h1>
          <h2 className="text-6xl md:text-8xl font-black text-zinc-900 tracking-tighter uppercase leading-[0.85] mb-8">
            The <br /> <span className="text-stone-300">Gallery</span>
          </h2>
          {/* <p className="text-zinc-500 text-lg md:text-xl leading-relaxed font-medium">
            {portfolio?.bio || "A visual record of our journey showcasing completed works and on-site operations."}
          </p> */}
        </div>

        {/* Improved Masonry Grid */}
        {gallery?.length > 0 ? (
          <div className="gallery-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 items-start">
            {gallery.map((item: any) => (
              <div 
                key={item._id}
                onClick={() => setSelectedImg(item)}
                className={`gallery-item group relative overflow-hidden bg-zinc-100 cursor-pointer transition-all duration-500 rounded-sm
                  ${item.size === 'large' || item.size === 'medium' 
                    ? 'lg:col-span-2 aspect-[2.8/2]' // Landscape 3:2
                    : 'lg:col-span-1 aspect-[2/3]' // Portrait 2:3
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
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-yellow-500 text-[9px] font-black uppercase tracking-widest mb-1 block">
                      {item.category || "General"}
                    </span>
                    <h4 className="text-white text-lg font-bold uppercase tracking-tight leading-tight">
                      {item.title}
                    </h4>
                    <div className="mt-3 flex items-center gap-2 text-white/60">
                        <Maximize2 className="w-3 h-3" />
                        <span className="text-[8px] font-bold uppercase tracking-widest">Open View</span>
                    </div>
                  </div>
                </div>
                
                {/* Hover Frame Effect */}
                <div className="absolute inset-0 border-[0px] group-hover:border-[1px] border-white/20 transition-all duration-500 pointer-events-none" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-500 font-medium">
             <p className="text-xl">Portfolio is currently empty.</p>
          </div>
        )}

        <div className="mt-32 border-t border-stone-200 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-stone-400 font-mono text-[10px] uppercase tracking-widest">
            © {new Date().getFullYear()} By {portfolio?.name || "Gowtham"}
          </p>
        </div>
      </div>

      {/* LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/98 p-4 md:p-12 backdrop-blur-md"
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

              <div className="w-full md:w-[350px] text-left space-y-6">
                <div>
                  <span className="text-yellow-500 text-xs font-black uppercase tracking-[0.4em]">
                    {selectedImg.category || "Project"}
                  </span>
                  <h3 className="text-white text-4xl font-black uppercase tracking-tighter mt-2 leading-none">
                    {selectedImg.title}
                  </h3>
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