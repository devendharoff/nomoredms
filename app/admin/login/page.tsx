'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldAlert, Lock, ArrowRight, UserPlus, Send, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

type Tab = 'login' | 'request';

export default function AdminPortalPage() {
    const [activeTab, setActiveTab] = useState<Tab>('login');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    // Login Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Request Form State
    const [requestEmail, setRequestEmail] = useState('');
    const [reason, setReason] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            // 1. Database Verification (Isolated Admin Layer)
            const { data, error: queryError } = await supabase
                .from('admin_accounts')
                .select('*')
                .eq('username', email)
                .eq('password_hash', password)
                .eq('is_active', true)
                .single();

            if (queryError || !data) {
                setMessage({ type: 'error', text: 'INVALID OPERATIVE ID OR SECURITY KEY.' });
                setLoading(false);
                return;
            }

            // 3. Success: Set Isolated Session Cookie
            const sessionValue = `ADMIN_SID_${Buffer.from(`${data.id}:${new Date().getTime()}`).toString('base64')}`;
            document.cookie = `admin_resource_access=${sessionValue}; path=/; max-age=86400; SameSite=Strict`;

            setMessage({ type: 'success', text: 'IDENTITY VERIFIED. Initializing Command Center...' });

            setTimeout(() => {
                router.push('/admin');
                router.refresh();
            }, 1000);

        } catch (err: any) {
            setMessage({ type: 'error', text: 'CRITICAL AUTH ERROR: Authorization server unreachable.' });
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const { error: insertError } = await supabase
                .from('admin_requests')
                .insert([{ email: requestEmail, reason }]);

            if (insertError) {
                if (insertError.code === '23505') {
                    throw new Error('A request with this email has already been submitted.');
                }
                throw insertError;
            }

            setSubmitted(true);
            setMessage({ type: 'success', text: 'Application transmitted and logged.' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Transmission failed. Try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4 selection:bg-red-500/30">
            <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-orange-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]" />

            <Link href="/" className="fixed top-6 left-6 z-50 p-3 bg-black/50 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/10 transition group">
                <svg className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>

            <div className="w-full max-w-sm space-y-6">
                <div className="text-center space-y-2 mb-8">
                    <div className="inline-flex items-center justify-center p-4 bg-red-500/10 rounded-[2rem] mb-4 border border-red-500/20 ring-4 ring-red-500/5">
                        <Lock className="h-8 w-8 text-red-500 animate-pulse" />
                    </div>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Security Clearance Required</h2>
                    <h1 className="text-5xl font-black italic tracking-tighter uppercase text-white">NOMOREDMS</h1>
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-2 flex gap-1 mb-6">
                    <button
                        onClick={() => { setActiveTab('login'); setMessage(null); }}
                        className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'login' ? 'bg-white text-black shadow-xl shadow-black/20' : 'text-zinc-500 hover:text-white'}`}
                    >
                        Admin Login
                    </button>
                    <button
                        onClick={() => { setActiveTab('request'); setMessage(null); }}
                        className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'request' ? 'bg-white text-black shadow-xl shadow-black/20' : 'text-zinc-500 hover:text-white'}`}
                    >
                        Request Access
                    </button>
                </div>

                <div className="bg-zinc-900/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden ring-1 ring-white/5">
                    {message && (
                        <div className={`mb-6 p-4 rounded-2xl border animate-in fade-in slide-in-from-top-2 text-[10px] font-black uppercase tracking-widest ${message.type === 'error'
                            ? 'bg-red-500/10 border-red-500/20 text-red-500'
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    {activeTab === 'login' ? (
                        <form onSubmit={handleAdminLogin} className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Operative ID</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-zinc-600" />
                                    <input
                                        type="text"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-black/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-white/20 transition-all font-mono placeholder:text-zinc-800"
                                        placeholder="USER_NAME"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Security Key</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-zinc-600" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-black/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-white/20 transition-all font-mono placeholder:text-zinc-800"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-16 bg-white text-black font-black uppercase tracking-[0.2em] text-[11px] rounded-[1.5rem] hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl"
                            >
                                {loading ? 'Validating...' : <>Authenticate Access <ArrowRight className="h-4 w-4" /></>}
                            </button>
                        </form>
                    ) : (
                        submitted ? (
                            <div className="text-center py-8 space-y-6">
                                <div className="p-4 bg-emerald-500/10 rounded-full inline-block">
                                    <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-black text-white italic">Transmission Logged</h3>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
                                    Our operatives will process your application via the Command Dashboard. Expect verification via Gmail soon.
                                </p>
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-widest underline underline-offset-4"
                                >
                                    New Application
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleRequestSubmit} className="space-y-5">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Official Gmail</label>
                                    <div className="relative">
                                        <Send className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                                        <input
                                            type="email"
                                            required
                                            value={requestEmail}
                                            onChange={(e) => setRequestEmail(e.target.value)}
                                            className="w-full bg-black/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-white/20 transition-all font-mono placeholder:text-zinc-800"
                                            placeholder="agent@gmail.com"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Statement of Intent</label>
                                    <textarea
                                        required
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="w-full bg-black/50 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-white/20 transition-all font-sans text-xs min-h-[140px] placeholder:text-zinc-800"
                                        placeholder="Identify your operational role..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-16 bg-white text-black font-black uppercase tracking-[0.2em] text-[11px] rounded-[1.5rem] hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl"
                                >
                                    {loading ? 'Transmitting...' : <>Submit for Verification <UserPlus className="h-4 w-4" /></>}
                                </button>
                            </form>
                        )
                    )}
                </div>

                <div className="text-center space-y-4">
                    <p className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em]">
                        NOMOREDMS Operations Division &copy; 2024
                    </p>
                </div>
            </div>
        </div>
    );
}
