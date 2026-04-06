"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Instagram, Facebook, ArrowUpRight } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ProfileSection({ portfolio }: { portfolio: any }) {
  const containerRef = useRef(null);

  useGSAP(() => {
    // Content animation
    gsap.from(".profile-content > *", {
      x: 30,
      opacity: 0,
      stagger: 0.1,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 75%",
      }
    });

    // Image reveal animation
    gsap.from(".profile-img-inner", {
      scale: 1.1,
      opacity: 0,
      duration: 1.5,
      ease: "expo.out",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 75%",
      }
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="py-20 px-6 md:px-6 bg-background text-foreground overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 lg:gap-32 items-start">
        <h2 className="text-neutral-900 text-3xl md:text-6xl font-light tracking-wide drop-shadow-md font-cursive">
          About me
        </h2>
        {/* Profile Image Area */}
        <div className="profile-img w-full md:w-1/2">
          <div className="profile-img-inner aspect-3/4 md:aspect-4/5 overflow-hidden bg-[#F5F5F5]">
            <img
              src={portfolio?.profileImage || "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2071&auto=format&fit=crop"}
              alt={portfolio?.name || "Profile"}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Profile Content Area */}
        <div className="profile-content w-full md:w-1/2 pt-4">
          {/* Section Title */}


          <div className="space-y-8 max-w-lg">
            <p className="text-base text-justify md:text-lg leading-relaxed font-medium text-foreground/80 font-sans">
              {portfolio?.bio || "I specialize in wedding and portrait photography, capturing the raw emotions and intimate moments that make each story unique."}
            </p>
          </div>

          {/* Social Media Links */}
          <div className="mt-10 flex items-center gap-6">
            {portfolio?.instagram && (
              <a
                href={portfolio.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 text-xs uppercase tracking-widest text-[#4A4A4A] hover:text-[#8B1A1A] transition-colors duration-300"
              >
                <Instagram size={18} strokeWidth={1.5} />
                <span>personal ID</span>
                <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            )}

            {portfolio?.facebook && (
              <a
                href={portfolio.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 text-xs uppercase tracking-widest text-[#4A4A4A] hover:text-[#8B1A1A] transition-colors duration-300"
              >
                <Instagram size={18} strokeWidth={1.5} />
                <span>commercial ID</span>
                <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            )}
          </div>

          {/* Stats / Signature Area */}
          {portfolio?.experienceYears && (
            <div className="mt-16 pt-8 border-t border-stone-200 flex items-center gap-8">
              <div className="flex flex-col">
                <span className="text-3xl font-serif italic text-neutral-900 leading-none">{portfolio.experienceYears}</span>
                <span className="text-[10px] lowercase font-bold tracking-[0.3em] mt-2 text-foreground/50">Years Behind the Lens</span>
              </div>
              <div className="w-12 h-px bg-stone-200"></div>
              <div className="flex flex-col">
                <span className="text-3xl font-serif italic text-neutral-900 leading-none">100+</span>
                <span className="text-[10px] lowercase font-bold tracking-[0.3em] mt-2 text-foreground/50">Souls Captured</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}