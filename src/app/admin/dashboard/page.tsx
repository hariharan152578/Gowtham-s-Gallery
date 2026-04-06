"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Loader2, Save, UploadCloud, X } from "lucide-react";

export default function PortfolioEditor() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Text fields state
    const [formData, setFormData] = useState({
        name: "",
        bio: "",
        experienceYears: 0,
        instagram: "",
        facebook: "",
    });

    // Image upload states
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/portfolio")
            .then(res => res.json())
            .then(data => {
                if (data.data) {
                    setFormData({
                        name: data.data.name || "",
                        bio: data.data.bio || "",
                        experienceYears: data.data.experienceYears || 0,
                        instagram: data.data.instagram || "",
                        facebook: data.data.facebook || "",
                    });
                    setCurrentImageUrl(data.data.profileImage || null);
                }
                setLoading(false);
            })
            .catch(() => {
                toast.error("Failed to load portfolio details");
                setLoading(false);
            });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const clearSelection = () => {
        setImageFile(null);
        setPreviewUrl(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem("adminToken");
            
            // Construct FormData
            const submitData = new FormData();
            submitData.append("name", formData.name);
            submitData.append("bio", formData.bio);
            submitData.append("experienceYears", formData.experienceYears.toString());
            submitData.append("instagram", formData.instagram);
            submitData.append("facebook", formData.facebook);
            
            if (imageFile) {
                submitData.append("image", imageFile);
            }

            const res = await fetch("/api/portfolio", {
                method: "PUT",
                headers: {
                    // Do NOT set Content-Type header with FormData
                    "Authorization": token || ""
                },
                body: submitData
            });

            if (res.ok) {
                toast.success("Portfolio updated successfully");
                // Reset image selection states after successful upload
                const updatedData = await res.json();
                setCurrentImageUrl(updatedData.data.profileImage);
                clearSelection(); 
            } else {
                toast.error("Failed to update portfolio");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-zinc-400" /></div>;

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">Portfolio Details</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Profile Image Upload Section */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Profile Image</label>
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        {/* Show preview of new upload OR current image */}
                        {(previewUrl || currentImageUrl) && (
                            <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black shrink-0">
                                <img src={previewUrl || currentImageUrl!} alt="Profile Preview" className="w-full h-full object-cover" />
                                {previewUrl && (
                                    <button 
                                        type="button" 
                                        onClick={clearSelection}
                                        className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        )}
                        
                        <div className="flex-1 w-full">
                            <label className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl bg-zinc-50 dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <UploadCloud className="w-8 h-8 mb-2 text-zinc-400" />
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                        <span className="font-semibold">Click to replace image</span>
                                    </p>
                                </div>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</label>
                        <input name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all shadow-sm outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Experience (Years)</label>
                        <input name="experienceYears" type="number" value={formData.experienceYears} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all shadow-sm outline-none" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Bio</label>
                    <textarea name="bio" rows={4} value={formData.bio} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all shadow-sm outline-none resize-none" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Personal ID Link</label>
                        <input name="instagram" value={formData.instagram} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all shadow-sm outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Commercial ID Link</label>
                        <input name="facebook" value={formData.facebook} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all shadow-sm outline-none" />
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-md active:scale-95 disabled:opacity-50">
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}