'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Zap, ShieldCheck, Mail, Lock, ArrowLeft, Chrome, Github, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function CreatorLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
    const [isSignUp, setIsSignUp] = useState(false);
    
    const router = useRouter();
    const searchParams = useSearchParams();
    const next = searchParams.get('next') || '/dashboard/creator';
    const supabase = createClient();

    const getRedirectUrl = () => {
        if (typeof window !== 'undefined') {
            return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
        }
        return '';
    };

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: getRedirectUrl(),
                },
            });

            if (error) {
                setMessage({ type: 'error', text: error.message });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'An unexpected error occurred' });
        } finally {
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setMessage(null);
            
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: getRedirectUrl(),
                    }
                });
                if (error) {
                    setMessage({ type: 'error', text: error.message });
                } else {
                    setMessage({ type: 'success', text: 'Check your email for the confirmation link!' });
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) {
                    setMessage({ type: 'error', text: error.message });
                } else {
                    router.push(next);
                    router.refresh();
                }
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'An unexpected error occurred' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Aesthetics */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)]" />
            </div>

            <Link 
                href="/" 
                className="fixed top-8 left-8 z-50 group flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
            >
                <ArrowLeft className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                <span className="text-xs font-black uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">Home</span>
            </Link>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <motion.div 
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        className="inline-flex items-center justify-center p-5 bg-gradient-to-br from-emerald-500/20 to-green-600/20 rounded-[2.5rem] mb-6 shadow-[0_0_50px_rgba(16,185,129,0.1)] border border-emerald-500/30 group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Zap className="h-10 w-10 text-emerald-400 fill-emerald-400/20 relative z-10" />
                    </motion.div>
                    
                    <h1 className="text-4xl font-black tracking-tighter uppercase mb-3 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
                        {isSignUp ? 'Creator Application' : 'Creator Portal'}
                    </h1>
                    <p className="text-zinc-500 font-medium tracking-tight">
                        {isSignUp ? 'Join our elite network of resource creators' : 'Securely access your operation dashboard'}
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-zinc-900/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-1 shadow-2xl overflow-hidden group">
                    <div className="bg-zinc-950/50 rounded-[2.4rem] p-8 sm:p-10 relative overflow-hidden">
                        {/* Internal Glow */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/5 blur-[60px] rounded-full pointer-events-none" />
                        
                        <AnimatePresence mode="wait">
                            {message && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className={`mb-6 p-4 rounded-2xl text-xs font-black uppercase tracking-widest border flex items-center gap-3 ${
                                        message.type === 'error' 
                                        ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                                        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                    }`}
                                >
                                    {message.type === 'error' ? <ShieldCheck className="w-4 h-4 shrink-0" /> : <Sparkles className="w-4 h-4 shrink-0" />}
                                    {message.text}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-6 relative z-10">
                            {/* Social Logins */}
                            <button
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-3 bg-white text-black font-black uppercase tracking-[0.15em] text-xs py-5 rounded-2xl hover:bg-zinc-200 transition-all active:scale-[0.98] disabled:opacity-50 group/google shadow-xl"
                            >
                                {loading ? (
                                    <div className="h-5 w-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Chrome className="h-4 w-4 transition-transform group-hover/google:rotate-12" />
                                        {isSignUp ? 'Join with Google' : 'Verify with Google'}
                                    </>
                                )}
                            </button>

                            <div className="relative flex items-center py-2">
                                <div className="flex-grow border-t border-white/5"></div>
                                <span className="flex-shrink mx-4 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">OR</span>
                                <div className="flex-grow border-t border-white/5"></div>
                            </div>

                            {/* Email Form */}
                            <form onSubmit={handleEmailAuth} className="space-y-4">
                                <div className="group/input relative">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within/input:text-emerald-500 transition-colors">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <input
                                        required
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl pl-14 pr-5 py-5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all font-medium hover:border-white/20"
                                        placeholder="Creator Email"
                                    />
                                </div>

                                <div className="group/input relative">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within/input:text-emerald-500 transition-colors">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        required
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl pl-14 pr-5 py-5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all font-medium hover:border-white/20"
                                        placeholder="Access Key"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black font-black uppercase tracking-[0.2em] text-xs py-5 rounded-2xl border border-emerald-500/30 hover:border-emerald-500 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg"
                                >
                                    {loading ? (isSignUp ? 'Processing...' : 'Verifying...') : (isSignUp ? 'Apply for Access' : 'Establish Session')}
                                </button>
                            </form>

                            {/* Toggle Sign In/Up */}
                            <div className="text-center pt-2">
                                <button
                                    onClick={() => {
                                        setIsSignUp(!isSignUp);
                                        setMessage(null);
                                    }}
                                    className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 hover:text-emerald-400 transition-colors font-black"
                                >
                                    {isSignUp ? 'Existing Creator? Portal Access' : 'New Talent? Join the Network'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Attribution */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 flex flex-col items-center gap-4"
                >
                    <div className="flex items-center gap-3 px-5 py-2 bg-white/5 rounded-full border border-white/5">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">NOMOREDMS Encrypted Identity</span>
                    </div>
                    
                    <div className="flex gap-8">
                        <Link href="/privacy-policy" className="text-[9px] font-bold uppercase tracking-widest text-zinc-700 hover:text-zinc-400 transition-colors">Privacy</Link>
                        <Link href="/terms-of-service" className="text-[9px] font-bold uppercase tracking-widest text-zinc-700 hover:text-zinc-400 transition-colors">Terms</Link>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
