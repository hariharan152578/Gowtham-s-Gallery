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
    };

    // Submit using FormData
    const handleAddImage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageFile) return toast.error("Please select an image file");

        setSaving(true);
        try {
            const token = localStorage.getItem("adminToken");
            
            // Construct FormData for file upload
            const formData = new FormData();
            formData.append("image", imageFile);
            formData.append("isActive", "true"); // Optional: matches the new API logic

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
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">Manage Hero Section</h1>

            {/* Upload New Image Form */}
            <form onSubmit={handleAddImage} className="mb-10 space-y-4">
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
                    
                    <div className="flex items-end">
                        <button 
                            type="submit" 
                            disabled={saving || !imageFile} 
                            className="flex items-center gap-2 px-6 py-3 h-12 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-md active:scale-95 disabled:opacity-50 whitespace-nowrap"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                            Upload Slide
                        </button>
                    </div>
                </div>
            </form>

            {/* Current Images List */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Active Slides ({images.length})</h2>
                {images.length === 0 ? (
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">No hero images found. Upload one above.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {images.map((img) => (
                            <div key={img._id} className="group relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black aspect-video">
                                <img src={img.imageUrl} alt="Hero slide" className="w-full h-full object-cover" />
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