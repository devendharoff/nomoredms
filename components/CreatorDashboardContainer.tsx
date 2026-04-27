'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { Creator, Resource, Category, Niche } from '@/types';
import { 
    Plus, Save, LogOut, Link as LinkIcon, Image as ImageIcon, Settings, 
    Grid, Instagram, Youtube, Copy, CheckCircle2, TrendingUp, 
    MousePointerClick, Flame, BarChart3, ChevronRight, LayoutDashboard,
    AlertCircle, Upload, Search
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDashboardOperations } from '@/lib/hooks/useDashboardOperations';


export default function CreatorDashboardContainer({ 
    creator, 
    initialResources = [],
    categories = [],
    niches = []
}: { 
    creator: Creator,
    initialResources: Resource[],
    categories: any[],
    niches: any[]
}) {
    const supabase = createClient();
    const router = useRouter();
    const { dropResource, updateProfile, loading: opLoading, error: opError } = useDashboardOperations();
    
    // Combine loading states
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (opLoading) setLoading(true);
        else setLoading(false);
    }, [opLoading]);

    
    const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'profile'>('overview');
    const [resources, setResources] = useState<Resource[]>(initialResources);
    
    // Profile State
    const [profileForm, setProfileForm] = useState({
        displayName: creator.displayName,
        slug: creator.slug,
        bio: creator.bio,
        profilePic: creator.profilePic,
        niche: creator.niche || '',
        instagram: creator.socials?.instagram || '',
        youtube: creator.socials?.youtube || ''
    });

    // Resource Form State
    const [isAddingResource, setIsAddingResource] = useState(false);
    const [resourceForm, setResourceForm] = useState({
        title: '', description: '', url: '', thumbnail: '', instagramPostUrl: '', category: categories[0]?.slug || 'Other', tags: ''
    });
    const [message, setMessage] = useState('');
    const [copied, setCopied] = useState(false);
    
    // Random fake metric just for the UI showcase (simulates traction tracking)
    const [fakeViews] = useState(Math.floor(Math.random() * 800) + 200);

    const completionScore = () => {
        let score = 0; let total = 6;
        if (profileForm.displayName && profileForm.displayName !== 'New Creator') score++;
        if (profileForm.slug) score++;
        if (profileForm.bio) score++;
        if (profileForm.profilePic) score++;
        if (profileForm.instagram || profileForm.youtube) score++;
        if (resources.length > 0) score++;
        return Math.round((score / total) * 100);
    };

    const handleCopyLink = () => {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nomoredms.com';
        navigator.clipboard.writeText(`${baseUrl}/creator/${profileForm.slug}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/creator-login');
    };

    const handleUploadFile = async (file: File, bucket: 'avatars' | 'thumbnails') => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
            return data.publicUrl;
        } catch (error: any) {
            console.error('Error uploading file:', error);
            setMessage('Error uploading file: ' + error.message);
            return null;
        }
    };

    const processFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, bucket: 'avatars' | 'thumbnails', callback: (url: string) => void) => {
        if (e.target.files && e.target.files[0]) {
            setLoading(true);
            const file = e.target.files[0];
            const url = await handleUploadFile(file, bucket);
            if (url) callback(url);
            setLoading(false);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        const socials = { ...creator.socials };
        if (profileForm.instagram) socials.instagram = profileForm.instagram;
        if (profileForm.youtube) socials.youtube = profileForm.youtube;

        const result = await updateProfile(creator.id, {
            ...profileForm,
            socials
        });

        if (result) {
            setMessage('Profile saved perfectly!');
            router.refresh();
        } else if (opError) {
            setMessage('Error saving profile: ' + opError);
        }
    };


    const handleAddResource = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        const tagsArray = resourceForm.tags.split(',').map(t => t.trim()).filter(Boolean);
        const resourceData = {
            ...resourceForm,
            tags: tagsArray
        };

        const result = await dropResource(creator.id, resourceData);

        if (result) {
            setMessage('Resource dropped successfully!');
            setResourceForm({ title: '', description: '', url: '', thumbnail: '', instagramPostUrl: '', category: categories[0]?.slug || 'Other', tags: '' });
            setIsAddingResource(false);
            
            // Optimistic local update (though Realtime will also trigger)
            setResources(prev => [result, ...prev]);
            
            // Refresh to ensure all server-side caches are cleared
            router.refresh();
        } else if (opError) {
            setMessage('Error adding resource: ' + opError);
        }
    };


    const TabButton = ({ value, icon: Icon, label }: any) => (
        <button
            onClick={() => { setActiveTab(value); setMessage(''); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-widest transition-all ${
                activeTab === value 
                ? 'bg-gradient-to-r from-green-400 to-emerald-600 text-black shadow-[0_0_30px_rgba(52,211,153,0.3)] shadow-green-500/20 scale-105' 
                : 'text-zinc-500 hover:bg-white/5 hover:text-white'
            }`}
        >
            <Icon className={`w-4 h-4 ${activeTab === value ? 'text-black' : 'text-zinc-500'}`} />
            <span className="hidden sm:inline">{label}</span>
        </button>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24 relative">
            {/* Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-green-500/10 blur-[150px] rounded-full pointer-events-none" />

            {/* Growth Loop Header */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="mb-12 bg-zinc-900/40 border border-white/10 p-4 sm:p-6 rounded-3xl backdrop-blur-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-green-400 to-emerald-600 p-[2px]">
                        <div className="w-full h-full rounded-full overflow-hidden bg-black border-[3px] border-black">
                            {profileForm.profilePic ? (
                                <img src={profileForm.profilePic} className="w-full h-full object-cover" alt="Avatar" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white font-black text-xl">
                                    {profileForm.displayName.charAt(0)}
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-white flex items-center gap-2">
                            Welcome, {profileForm.displayName.split(' ')[0]} <Flame className="w-5 h-5 text-orange-500 fill-orange-500/20" />
                        </h2>
                        <p className="text-sm text-zinc-400 font-medium">Your VIP Operations Hub</p>
                    </div>
                </div>

                <div className="w-full md:w-auto flex flex-col items-center sm:items-end gap-3 relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-400">Your Custom Bio Link</span>
                    <button 
                        onClick={handleCopyLink}
                        className="flex items-center gap-3 bg-black border border-white/10 hover:border-green-500/50 px-6 py-3 rounded-full transition-all group active:scale-95 shadow-xl w-full sm:w-auto justify-center"
                    >
                        <span className="text-sm font-medium text-zinc-300 group-hover:text-white">nomoredms.com/creator/<span className="font-bold text-white">{profileForm.slug}</span></span>
                        {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-zinc-500 group-hover:text-white" />}
                    </button>
                </div>
            </motion.div>

            {/* Navigation & Logout */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 sticky top-4 z-50">
                <div className="flex gap-2 bg-zinc-900/80 p-2 rounded-3xl backdrop-blur-2xl border border-white/5 shadow-2xl overflow-x-auto w-full sm:w-auto">
                    <TabButton value="overview" icon={LayoutDashboard} label="Overview" />
                    <TabButton value="resources" icon={Grid} label="My Drops" />
                    <TabButton value="profile" icon={Settings} label="Brand Kit" />
                </div>
                
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-zinc-900/50 backdrop-blur-md border border-white/10 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all font-bold text-xs tracking-widest uppercase w-full sm:w-auto justify-center"
                >
                    <LogOut className="w-4 h-4" /> Exit
                </button>
            </div>

            {/* Global Notification system */}
            <AnimatePresence>
                {message && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className={`mb-8 p-4 rounded-2xl text-sm font-black tracking-wide border backdrop-blur-md flex items-center justify-center gap-2 ${
                            message.includes('Error') ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-green-500/10 text-green-400 border-green-500/30'
                        }`}
                    >
                        {message.includes('Error') ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                        {message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Context Views */}
            <AnimatePresence mode="wait">
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-6">
                        
                        {/* Gamification Progress */}
                        {completionScore() < 100 && (
                            <div className="bg-gradient-to-r from-zinc-900/80 to-zinc-900 p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-xl">
                                <div className="space-y-2 text-center md:text-left">
                                    <h3 className="text-xl font-black uppercase tracking-tight flex items-center justify-center md:justify-start gap-2">
                                        Level Up Your Profile <TrendingUp className="w-5 h-5 text-green-400" />
                                    </h3>
                                    <p className="text-sm text-zinc-400">Complete your Brand Kit to maximize inbound leads.</p>
                                </div>
                                <div className="flex items-center gap-6 w-full md:w-auto">
                                    <div className="flex-1 md:w-48 bg-black rounded-full h-3 border border-white/5 overflow-hidden relative">
                                        <motion.div 
                                            initial={{ width: 0 }} animate={{ width: `${completionScore()}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" 
                                        />
                                    </div>
                                    <span className="text-2xl font-black">{completionScore()}%</span>
                                </div>
                                <button onClick={() => setActiveTab('profile')} className="shrink-0 bg-white text-black px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform hidden md:block">
                                    Finish Now
                                </button>
                            </div>
                        )}

                        {/* Vanity Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: 'Total Resources Live', value: resources.length, icon: Grid, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
                                { title: 'Audience Followers', value: creator.followersCount, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
                                { title: '30-Day Link Clicks', value: resources.length > 0 ? fakeViews : 0, icon: MousePointerClick, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' }
                            ].map((stat, i) => (
                                <motion.div 
                                    key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                    className="bg-zinc-900/60 border border-white/5 p-6 rounded-3xl backdrop-blur-xl hover:bg-zinc-800/60 transition-colors group cursor-default"
                                >
                                    <div className="flex items-center justify-between mb-8">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{stat.title}</span>
                                        <div className={`p-2 rounded-xl ${stat.bg}`}><stat.icon className={`w-4 h-4 ${stat.color}`} /></div>
                                    </div>
                                    <div className="text-5xl font-black tracking-tighter group-hover:scale-105 transition-transform origin-left">{stat.value}</div>
                                </motion.div>
                            ))}
                        </div>

                    </motion.div>
                )}

                {/* PROFILE SETUP TAB */}
                {activeTab === 'profile' && (
                    <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} className="max-w-4xl mx-auto space-y-6">
                        <form onSubmit={handleSaveProfile} className="space-y-6">
                            
                            {/* Brand Identity Card */}
                            <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 sm:p-10 backdrop-blur-xl">
                                <h3 className="text-xl font-black uppercase tracking-tight mb-8 text-white flex items-center gap-3">
                                    <span className="p-2 bg-white/5 rounded-lg border border-white/10"><Settings className="w-5 h-5 text-zinc-300" /></span> 
                                    Core Brand Identity
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2">Display Name</label>
                                        <input required value={profileForm.displayName} onChange={e => setProfileForm({...profileForm, displayName: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 hover:border-white/20 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2">Unique Slug</label>
                                        <div className="relative">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 font-bold">/</span>
                                            <input required value={profileForm.slug} onChange={e => setProfileForm({...profileForm, slug: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-2xl pl-10 pr-5 py-4 text-zinc-300 focus:ring-2 focus:ring-green-500/50 hover:border-white/20 outline-none transition-all" />
                                        </div>
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2">Short Bio</label>
                                        <textarea rows={3} value={profileForm.bio} onChange={e => setProfileForm({...profileForm, bio: e.target.value})} placeholder="I create cinematic resources..." className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-green-500/50 hover:border-white/20 outline-none transition-all resize-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2">Niche Category</label>
                                        <select value={profileForm.niche} onChange={e => setProfileForm({...profileForm, niche: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-green-500/50 hover:border-white/20 outline-none transition-all appearance-none cursor-pointer">
                                            {niches.map(niche => <option key={niche.slug} value={niche.slug} className="bg-zinc-900 text-white p-2">{niche.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2">Avatar Media</label>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            {profileForm.profilePic && (
                                                <div className="relative group/avatar shrink-0">
                                                    <img src={profileForm.profilePic} className="w-14 h-14 rounded-full border-2 border-white/10 object-cover shadow-2xl" alt="Preview" />
                                                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex-1 space-y-3">
                                                <input value={profileForm.profilePic} onChange={e => setProfileForm({...profileForm, profilePic: e.target.value})} placeholder="Direct Image URL (https://...)" className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-green-500/50 hover:border-white/20 outline-none transition-all text-xs" />
                                                <div className="flex items-center gap-3">
                                                    <label className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all group/btn">
                                                        <Upload className="w-3.5 h-3.5 text-zinc-500 group-hover/btn:text-white" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover/btn:text-white">Upload from Device</span>
                                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => processFileUpload(e, 'avatars', (url) => setProfileForm({...profileForm, profilePic: url }))} />
                                                    </label>
                                                    {loading && <div className="w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Social Connectivity Card */}
                            <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 sm:p-10 backdrop-blur-xl">
                                <h3 className="text-xl font-black uppercase tracking-tight mb-8 text-white flex items-center gap-3">
                                    <span className="p-2 bg-pink-500/10 rounded-lg border border-pink-500/20"><Instagram className="w-5 h-5 text-pink-500" /></span> 
                                    Social Connectivity
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2">Instagram Link</label>
                                        <input value={profileForm.instagram} onChange={e => setProfileForm({...profileForm, instagram: e.target.value})} placeholder="https://instagram.com/..." className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-pink-500/50 hover:border-pink-500/30 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2 text-red-400">YouTube Link</label>
                                        <input value={profileForm.youtube} onChange={e => setProfileForm({...profileForm, youtube: e.target.value})} placeholder="https://youtube.com/..." className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-red-500/50 hover:border-red-500/30 outline-none transition-all" />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="w-full group relative overflow-hidden bg-white text-black font-black uppercase tracking-[0.2em] text-sm py-5 rounded-2xl transition-transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 border border-white shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)]">
                                <span className="relative z-10 flex items-center gap-2"><Save className="w-4 h-4" /> Save Brand Profile</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-zinc-200 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        </form>
                    </motion.div>
                )}

                {/* MY DROPS / RESOURCES TAB */}
                {activeTab === 'resources' && (
                    <motion.div key="resources" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-8">
                        {!isAddingResource ? (
                            <>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                                        Your Resource Drops <span className="text-xs font-medium text-zinc-500 tracking-widest">({resources.length})</span>
                                    </h3>
                                    <button onClick={() => setIsAddingResource(true)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-green-500 text-black font-black uppercase tracking-widest text-xs hover:bg-green-400 hover:scale-105 transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                                        <Plus className="w-4 h-4" /> Drop New
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {resources.map(resource => (
                                        <div key={resource.id} className="bg-zinc-900/40 rounded-[2rem] p-4 border border-white/5 backdrop-blur-xl group hover:-translate-y-2 hover:border-white/20 transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex flex-col h-full">
                                            <div className="aspect-square w-full rounded-[1.5rem] bg-black overflow-hidden mb-5 relative shrink-0">
                                                {resource.thumbnail ? (
                                                    <img src={resource.thumbnail} alt={resource.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-zinc-900"><ImageIcon className="w-8 h-8 text-zinc-800" /></div>
                                                )}
                                                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white border border-white/10">
                                                    {resource.category}
                                                </div>
                                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 pt-10 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
                                                    <a href={resource.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold text-green-400 hover:text-green-300">
                                                        <LinkIcon className="w-3 h-3" /> View Source
                                                    </a>
                                                    {resource.instagramPostUrl && (
                                                        <a href={resource.instagramPostUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold text-pink-500 hover:text-pink-400 mt-2">
                                                            <Instagram className="w-3 h-3" /> Instagram Link
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="px-2 pb-2 flex-grow flex flex-col justify-between overflow-hidden">
                                                <h4 className="font-black text-lg line-clamp-2 leading-tight tracking-tight mb-2 text-zinc-100">{resource.title}</h4>
                                                <p className="text-zinc-500 text-xs font-medium line-clamp-2 leading-relaxed">{resource.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {resources.length === 0 && (
                                        <div className="col-span-full py-24 flex flex-col items-center justify-center text-center border border-dashed border-white/10 rounded-3xl bg-zinc-900/20">
                                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4"><Grid className="w-8 h-8 text-zinc-600" /></div>
                                            <h3 className="text-xl font-black tracking-tight text-white mb-2">No Live Resources</h3>
                                            <p className="text-zinc-500 text-sm max-w-sm">You haven't dropped any resources. Upload tools, LUTs, or guides to attract inbound leads.</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <form onSubmit={handleAddResource} className="bg-zinc-900/40 rounded-3xl p-6 sm:p-10 border border-white/5 backdrop-blur-xl max-w-3xl mx-auto shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-green-500/5 blur-[100px] rounded-full pointer-events-none" />
                                
                                <h2 className="text-2xl font-black uppercase tracking-tight mb-8 text-white relative z-10">Upload New Drop</h2>
                                
                                <div className="space-y-6 relative z-10">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2">Resource Title</label>
                                        <input required value={resourceForm.title} onChange={e => setResourceForm({...resourceForm, title: e.target.value})} placeholder="e.g. Free Cinematic LUTs" className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-green-500/50 hover:border-white/20 outline-none transition-all" />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2">Category</label>
                                            <select required value={resourceForm.category} onChange={e => setResourceForm({...resourceForm, category: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-green-500/50 hover:border-white/20 outline-none transition-all appearance-none">
                                                {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2">Search Tags</label>
                                            <input value={resourceForm.tags} onChange={e => setResourceForm({...resourceForm, tags: e.target.value})} placeholder="LUTs, Video, Editing" className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-green-500/50 hover:border-white/20 outline-none transition-all" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2 text-green-400">Resource Output URL (The Delivery String)</label>
                                        <input required type="url" value={resourceForm.url} onChange={e => setResourceForm({...resourceForm, url: e.target.value})} placeholder="https://drive.google.com/..." className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-green-500/50 hover:border-white/20 outline-none transition-all" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2">Thumbnail Banner</label>
                                        <div className="space-y-4">
                                            <div className="relative">
                                                <input required type="url" value={resourceForm.thumbnail} onChange={e => setResourceForm({...resourceForm, thumbnail: e.target.value})} placeholder="https://..." className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-green-500/50 hover:border-white/20 outline-none transition-all pl-12" />
                                                <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <label className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all group/btn">
                                                    <Upload className="w-4 h-4 text-zinc-500 group-hover/btn:text-white" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover/btn:text-white">Upload Thumbnail</span>
                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => processFileUpload(e, 'thumbnails', (url) => setResourceForm({...resourceForm, thumbnail: url }))} />
                                                </label>
                                                {resourceForm.thumbnail && (
                                                    <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-xl">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-green-400">Image Synced</span>
                                                    </div>
                                                )}
                                                {loading && <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2 p-5 bg-pink-500/5 border border-pink-500/20 rounded-2xl">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-500 flex items-center gap-2"><Instagram className="w-4 h-4" /> Instagram Direct Link</label>
                                        <p className="text-[10px] text-zinc-400 font-medium tracking-wide mb-3">If provided, tapping the resource logo redirects viewers to your social post.</p>
                                        <input type="url" value={resourceForm.instagramPostUrl} onChange={e => setResourceForm({...resourceForm, instagramPostUrl: e.target.value})} placeholder="https://instagram.com/reel/..." className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-pink-500/50 hover:border-pink-500/30 outline-none transition-all" />
                                    </div>

                                    <div className="flex flex-col-reverse sm:flex-row gap-4 pt-8">
                                        <button type="button" onClick={() => setIsAddingResource(false)} className="px-6 py-4 bg-transparent border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 font-black uppercase tracking-widest text-sm rounded-xl transition-all sm:w-1/3">
                                            Cancel
                                        </button>
                                        <button type="submit" disabled={loading} className="px-6 py-4 bg-green-500 text-black shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:shadow-[0_0_40px_rgba(52,211,153,0.5)] hover:bg-green-400 hover:scale-[1.02] active:scale-95 font-black uppercase tracking-widest text-sm rounded-xl transition-all flex-1">
                                            Publish Drop
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
