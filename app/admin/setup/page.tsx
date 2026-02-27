'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ShieldCheck, Lock, ArrowRight, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function AdminSetupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

    const supabase = createClient();

    const handleSetup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        // 1. Verify Secret Key
        if (secretKey !== process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY) {
            setMessage({ type: 'error', text: 'INVALID SECRET COMMAND CODE.' });
            setLoading(false);
            return;
        }

        try {
            // 2. Clear session for clean start
            await supabase.auth.signOut();

            // 3. Attempt SignUp
            let { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            // If account exists, try SignIn
            if (authError?.message?.includes('already registered')) {
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                if (signInError) throw signInError;
                authData = signInData;
            } else if (authError) {
                throw authError;
            }

            if (authData.user) {
                // 4. Force Promotion to Admin using UPSERT
                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: authData.user.id,
                        email: email,
                        role: 'admin'
                    }, { onConflict: 'id' });

                if (profileError) throw profileError;

                setMessage({
                    type: 'success',
                    text: 'PROTOCOL COMPLETE: Your account is now a Master Admin. Proceed to login.'
                });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to initialize admin.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4">
            <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 to-blue-600" />

            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 rounded-full mb-4 ring-1 ring-emerald-500/20">
                        <ShieldCheck className="h-6 w-6 text-emerald-500" />
                    </div>
                    <h2 className="text-xl font-mono uppercase tracking-widest text-emerald-500 font-bold">Admin Initialization</h2>
                    <h1 className="text-3xl font-black tracking-tighter text-white">Create New Admin</h1>
                </div>

                <div className="bg-zinc-900 shadow-2xl border border-white/5 rounded-3xl p-8">
                    {message && (
                        <div className={`mb-6 p-4 rounded-xl text-xs font-bold border ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                            {message.text}
                            {message.type === 'success' && (
                                <Link href="/admin/login" className="block mt-2 underline">Go to Login Page →</Link>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleSetup} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Master Secret Code</label>
                            <input
                                type="password"
                                required
                                value={secretKey}
                                onChange={(e) => setSecretKey(e.target.value)}
                                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 transition-all font-mono"
                                placeholder="Enter Master Code"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Admin Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 transition-all"
                                placeholder="admin@yourdomain.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Security Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/10"
                        >
                            {loading ? 'Initializing...' : (
                                <>
                                    <UserPlus className="h-4 w-4" /> Finalize Admin Account
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
                    This setup link should be removed after first use.
                </p>
            </div>
        </div>
    );
}
