"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { Loader2, Plus, Trash2, Upload, X, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function GalleryManagement() {
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [size, setSize] = useState("small"); // 'small' = Portrait, 'large' = Landscape
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchGallery = async () => {
        try {
            const res = await fetch("/api/gallery");
            const data = await res.json();
            if (res.ok) setImages(data.data);
        } catch (error) {
            toast.error("Failed to load gallery");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGallery();
    }, []);

    // Handle file selection and preview
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        setFile(selectedFile);

        if (selectedFile) {
            const url = URL.createObjectURL(selectedFile);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return toast.error("Please select an image");

        setUploading(true);
        const token = localStorage.getItem("adminToken");
        const formData = new FormData();
        formData.append("title", title);
        formData.append("category", category);
        formData.append("size", size); 
        formData.append("description", description);
        formData.append("image", file);

        try {
            const res = await fetch("/api/gallery", {
                method: "POST",
                headers: { "Authorization": token || "" },
                body: formData
            });

            if (res.ok) {
                toast.success("Image uploaded successfully");
                setShowModal(false);
                // Reset form
                setTitle(""); 
                setCategory(""); 
                setSize("small");
                setDescription(""); 
                setFile(null);
                setPreviewUrl(null);
                fetchGallery();
            } else {
                toast.error("Failed to upload image");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this image?")) return;

        const token = localStorage.getItem("adminToken");
        try {
            const res = await fetch(`/api/gallery/${id}`, {
                method: "DELETE",
                headers: { "Authorization": token || "" }
            });

            if (res.ok) {
                toast.success("Image deleted");
                setImages(images.filter(img => img._id !== id));
            } else {
                toast.error("Failed to delete");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-zinc-400" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Gallery Management</h1>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-md active:scale-95">
                    <Plus className="w-5 h-5" />
                    Upload Image
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {images.map((img) => (
                    <div key={img._id} className="group relative bg-zinc-100 dark:bg-zinc-900 rounded-3xl overflow-hidden aspect-[4/5] shadow-sm border border-zinc-200 dark:border-zinc-800">
                        <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />

                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6">
                                <div className="flex gap-2">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white shadow-sm">
                                        <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                                        <span className="text-xs font-bold">{img.likes || 0}</span>
                                    </div>
                                    <button onClick={() => handleDelete(img._id)} className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            <div>
                                <h3 className="text-white font-bold text-xl">{img.title}</h3>
                                {img.category && (
                                    <p className="text-white/80 font-medium text-sm mt-1">
                                        {img.category} • <span className="capitalize">{img.size === 'small' ? '2x3 Portrait' : '3x2 Landscape'}</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[90vh] border border-zinc-200 dark:border-zinc-800 relative"
                        >
                            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors z-10">
                                <X className="w-5 h-5" />
                            </button>

                            <div className="p-8">
                                <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-white">Upload New Image</h2>
                                <p className="text-zinc-500 text-sm mb-6">Recommended sizes: 2x3" (Portrait) or 3x2" (Landscape)</p>

                                <form onSubmit={handleUpload} className="space-y-5">
                                    <div
                                        className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors flex flex-col items-center justify-center cursor-pointer relative min-h-[200px]"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                        
                                        {previewUrl ? (
                                            <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                    <p className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">Change Image</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className="w-10 h-10 text-zinc-400 mb-3" />
                                                <p className="font-medium text-zinc-600 dark:text-zinc-400 text-center">Click to browse or drag and drop</p>
                                                <p className="text-xs text-zinc-400 mt-1">PNG, JPG, WEBP</p>
                                            </>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Title *</label>
                                            <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all outline-none" placeholder="Project Name" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Category</label>
                                            <input value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all outline-none" placeholder="Exterior" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Frame Orientation</label>
                                        <select 
                                            value={size} 
                                            onChange={(e) => setSize(e.target.value)} 
                                            className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all outline-none"
                                        >
                                            <option value="small">Portrait (2x3 Ratio)</option>
                                            <option value="large">Landscape (3x2 Ratio)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
                                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all outline-none resize-none" placeholder="Briefly describe the visual..." rows={2} />
                                    </div>

                                    <button type="submit" disabled={uploading} className="w-full flex items-center justify-center py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-md active:scale-95 disabled:opacity-50 mt-4">
                                        {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Upload to Gallery"}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}