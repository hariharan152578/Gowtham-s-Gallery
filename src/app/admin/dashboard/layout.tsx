"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, Image as ImageIcon, LogOut, Monitor, Menu, X } from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        if (!token) {
            router.push("/admin/login");
        } else {
            setLoading(false);
        }
    }, [router]);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        router.push("/admin/login");
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black"><div className="w-8 h-8 border-4 border-black dark:border-white border-t-transparent rounded-full animate-spin" /></div>;

   const navItems = [
      { name: "Portfolio Details", href: "/admin/dashboard", icon: LayoutDashboard },
      { name: "Manage Hero", href: "/admin/dashboard/hero", icon: Monitor }, 
      { name: "Manage Gallery", href: "/admin/dashboard/gallery", icon: ImageIcon },
  ];

    const SidebarContent = () => (
        <>
            <div>
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="w-10 h-10 bg-zinc-900 dark:bg-zinc-100 rounded-xl flex items-center justify-center">
                        <span className="text-white dark:text-black font-bold text-xl">G</span>
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Admin Panel</h2>
                </div>

                <nav className="space-y-2">
                    {navItems.map((item) => {
                        const active = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link 
                                key={item.name} 
                                href={item.href} 
                                className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${active ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50' : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-50'}`}
                            >
                                <Icon className="w-5 h-5" />
                                {item.name}
                                {active && (
                                    <motion.div 
                                        layoutId="activeNav" 
                                        className="absolute left-0 w-1 h-6 bg-zinc-900 dark:bg-zinc-50 rounded-r-md" 
                                    />
                                )}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <button 
                onClick={handleLogout} 
                className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all font-medium mt-auto"
            >
                <LogOut className="w-5 h-5" />
                Sign Out
            </button>
        </>
    );

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col md:flex-row font-sans">
            
            {/* Mobile Header */}
            <header className="md:hidden bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800 p-4 sticky top-0 z-40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-900 dark:bg-zinc-100 rounded-lg flex items-center justify-center">
                        <span className="text-white dark:text-black font-bold text-lg">G</span>
                    </div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-50">Admin</span>
                </div>
                <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </header>

            {/* Desktop Sidebar */}
            <aside className="w-72 bg-white dark:bg-black border-r border-zinc-200 dark:border-zinc-800 p-6 flex-col justify-between hidden md:flex sticky top-0 h-screen">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-[80%] max-w-xs bg-white dark:bg-black z-50 p-6 flex flex-col justify-between md:hidden shadow-2xl"
                        >
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-12 overflow-x-hidden">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="max-w-4xl mx-auto"
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
}
