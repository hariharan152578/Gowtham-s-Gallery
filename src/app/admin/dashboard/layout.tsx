"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, Image as ImageIcon, LogOut, Monitor } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        if (!token) {
            router.push("/admin/login");
        } else {
            setLoading(false);
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        router.push("/admin/login");
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black"><div className="w-8 h-8 border-4 border-black dark:border-white border-t-transparent rounded-full animate-spin" /></div>;

   const navItems = [
      { name: "Portfolio Details", href: "/admin/dashboard", icon: LayoutDashboard },
      { name: "Manage Hero", href: "/admin/dashboard/hero", icon: Monitor }, // NEW ITEM
      { name: "Manage Gallery", href: "/admin/dashboard/gallery", icon: ImageIcon },
  ];

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex font-sans">

            {/* Sidebar */}
            <aside className="w-72 bg-white dark:bg-black border-r border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-between hidden md:flex sticky top-0 h-screen">
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
                                <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${active ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50' : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-50'}`}>
                                    <Icon className="w-5 h-5" />
                                    {item.name}
                                    {active && <motion.div layoutId="activeNav" className="absolute left-0 w-1 h-8 bg-zinc-900 dark:bg-zinc-50 rounded-r-md" />}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all font-medium mt-auto">
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 md:p-12 overflow-y-auto">
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
