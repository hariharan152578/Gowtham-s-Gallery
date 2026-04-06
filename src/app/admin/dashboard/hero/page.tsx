"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Loader2, Plus, Trash2, Image as ImageIcon, UploadCloud, X } from "lucide-react";

export default function HeroEditor() {
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // New states for file upload
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [device, setDevice] = useState<'mobile' | 'desktop'>('desktop');

    const fetchHeroImages = () => {
        fetch("/api/hero")
            .then(res => res.json())
            .then(data => {
                if (data.data) setImages(data.data); // Make sure this matches your GET response structure
                setLoading(false);
            })
            .catch(() => {
                toast.error("Failed to load hero images");
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchHeroImages();
    }, []);

    // Handle file selection and generate preview
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // Clear the selected file
    const clearSelection = () => {
        setImageFile(null);
        setPreviewUrl(null);
        setTitle("");
        setSubtitle("");
    };

    // Submit using FormData
    const handleAddImage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageFile) return toast.error("Please select an image file");

        setSaving(true);
        try {
            const token = localStorage.getItem("adminToken");
            
            const formData = new FormData();
            console.log(`[FRONTEND-HERO] Uploading image for device: ${device}`);
            formData.append("image", imageFile);
            formData.append("isActive", "true");
            formData.append("device", device);
            formData.append("title", title);
            formData.append("subtitle", subtitle);

            const res = await fetch("/api/hero", {
                method: "POST",
                headers: {
                    // Note: Do NOT set "Content-Type" manually when sending FormData.
                    // The browser will automatically set it with the correct boundary.
                    "Authorization": token || ""
                },
                body: formData
            });

            if (res.ok) {
                toast.success("Hero image uploaded!");
                clearSelection(); // Reset form
                fetchHeroImages(); // Refresh list
            } else {
                const errData = await res.json();
                toast.error(errData.message || "Failed to upload image");
            }
        } catch (error) {
            toast.error("An error occurred during upload");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this image?")) return;

        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(`/api/hero/${id}`, { // Fixed path to match dynamic route
                method: "DELETE",
                headers: { "Authorization": token || "" }
            });

            if (res.ok) {
                toast.success("Image deleted");
                fetchHeroImages(); // Refresh list
            } else {
                toast.error("Failed to delete image");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-zinc-400" /></div>;

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Manage Hero Section</h1>
                
                {/* View Tabs */}
                <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl w-fit">
                    <button
                        type="button"
                        onClick={() => setDevice('desktop')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                            device === 'desktop' 
                            ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-white' 
                            : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                        }`}
                    >
                        <ImageIcon className="w-4 h-4" />
                        Big Screen
                    </button>
                    <button
                        type="button"
                        onClick={() => setDevice('mobile')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                            device === 'mobile' 
                            ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-white' 
                            : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                        }`}
                    >
                        <UploadCloud className="w-4 h-4" />
                        Mobile Screen
                    </button>
                </div>
            </div>

            {/* Upload Section - Contextual to Active Tab */}
            <div className="mb-12 p-6 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-3xl">
                <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">
                    Add New {device === 'desktop' ? 'Desktop' : 'Mobile'} Slide
                </h2>
                <form onSubmit={handleAddImage} className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        {previewUrl ? (
                            <div className="relative w-full h-48 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black">
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                <button 
                                    type="button" 
                                    onClick={clearSelection}
                                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <label className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <UploadCloud className="w-10 h-10 mb-3 text-zinc-400" />
                                    <p className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">SVG, PNG, JPG or WEBP (Max: 5MB)</p>
                                </div>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </label>
                        )}
                    </div>
                    
                    <div className="flex-1 space-y-4">
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Slide Title</label>
                            <input 
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter bold heading..."
                                className="w-full px-5 py-3 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Slide Subtitle</label>
                            <input 
                                type="text"
                                value={subtitle}
                                onChange={(e) => setSubtitle(e.target.value)}
                                placeholder="Enter lowercase tagline..."
                                className="w-full px-5 py-3 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white outline-none transition-all"
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={saving || !imageFile} 
                            className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-md active:scale-95 disabled:opacity-50 whitespace-nowrap"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                            Upload {device === 'desktop' ? 'Desktop' : 'Mobile'} Slide
                        </button>
                    </div>
                </div>
            </form>
            </div>

            {/* Current Images List - Filtered by Active Tab */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">
                        Active {device === 'desktop' ? 'Desktop' : 'Mobile'} Slides 
                        <span className="ml-2 text-zinc-400 font-normal">({images.filter(img => (img.device || 'desktop') === device).length})</span>
                    </h2>
                </div>
                
                {images.filter(img => (img.device || 'desktop') === device).length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                        < ImageIcon className="w-12 h-12 mx-auto mb-4 text-zinc-300" />
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium">No {device === 'desktop' ? 'Desktop' : 'Mobile'} slides found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {images.filter(img => (img.device || 'desktop') === device).map((img) => (
                            <div key={img._id} className="group relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black aspect-video">
                                <img src={img.imageUrl} alt="Hero slide" className="w-full h-full object-cover" />
                                
                                {/* Device Badge */}
                                <div className="absolute top-3 left-3 z-10">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border ${
                                        img.device === 'mobile' 
                                        ? 'bg-indigo-500/90 text-white border-indigo-400' 
                                        : 'bg-zinc-800/90 text-white border-zinc-700'
                                    }`}>
                                        {img.device === 'mobile' ? 'Mobile' : 'Desktop'}
                                    </span>
                                </div>
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button 
                                        onClick={() => handleDelete(img._id)}
                                        className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-transform hover:scale-105 shadow-lg"
                                        title="Delete Image"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}