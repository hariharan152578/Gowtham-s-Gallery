import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Outfit, Great_Vibes } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

const greatVibes = Great_Vibes({
  variable: "--font-cursive",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Gowtham Gallary | Capturing the Extraordinary",
  description: "A premium photography portfolio by Gowtham Gallary",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${outfit.variable} ${greatVibes.variable} antialiased bg-stone-50 dark:bg-black text-zinc-900 dark:text-zinc-100 transition-colors duration-300`}
      >
        <Toaster position="top-center" />
        {children}
      </body>
    </html>
  );
}
