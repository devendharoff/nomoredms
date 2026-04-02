'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, UserPlus, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Creator } from '../types';

interface CreatorCardProps {
    creator: Creator;
    onNavigate: (slug: string) => void;
}

const CreatorCard = ({ creator, onNavigate }: CreatorCardProps) => {
    return (
        <motion.div
            layout
            onClick={() => onNavigate(creator.slug)}
            className="group relative cursor-pointer overflow-hidden rounded-[2rem] border border-zinc-100 dark:border-white/5 bg-white dark:bg-neutral-900/40 p-6 transition-all hover:-translate-y-1 hover:border-zinc-300 dark:hover:border-white/20 hover:shadow-2xl hover:shadow-green-500/5 backdrop-blur-sm"
        >
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-white/10 flex items-center justify-center">
                    <UserPlus className="h-4 w-4 text-zinc-950 dark:text-white" />
                </div>
            </div>

            <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-green-500 blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-700" />
                    {creator.profilePic ? (
                        <Image
                            src={creator.profilePic}
                            alt={creator.displayName || 'Creator'}
                            width={96}
                            height={96}
                            className="relative h-24 w-24 rounded-full border-4 border-white dark:border-neutral-800 object-cover shadow-lg group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="relative h-24 w-24 rounded-full border-4 border-white dark:border-neutral-800 bg-zinc-100 dark:bg-neutral-800 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500">
                            <Users className="h-8 w-8 text-zinc-400 dark:text-neutral-600" />
                        </div>
                    )}
                    {creator.isVerified && (
                        <div className="absolute bottom-1 right-1 bg-white dark:bg-neutral-900 rounded-full p-1 shadow-md">
                            <ShieldCheck className="h-5 w-5 text-green-500 fill-current" />
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white group-hover:text-green-500 transition-colors">
                        {creator.displayName}
                    </h3>
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-neutral-500">
                        @{creator.username}
                    </p>
                </div>

                {creator.niche && (
                    <div className="rounded-full bg-zinc-100 dark:bg-white/5 px-4 py-1.5 border border-zinc-200 dark:border-white/5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-neutral-400">
                            {creator.niche}
                        </span>
                    </div>
                )}

                {(creator.socials?.instagram || creator.socials?.youtube) && (
                    <div className="flex items-center gap-3 pt-2">
                        {creator.socials.instagram && (
                            <a 
                                href={creator.socials.instagram} 
                                target="_blank" 
                                rel="noreferrer" 
                                onClick={(e) => e.stopPropagation()}
                                className="p-1.5 rounded-full bg-zinc-100 dark:bg-white/5 hover:bg-pink-500/10 hover:text-pink-500 transition-colors"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                            </a>
                        )}
                        {creator.socials.youtube && (
                            <a 
                                href={creator.socials.youtube} 
                                target="_blank" 
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-1.5 rounded-full bg-zinc-100 dark:bg-white/5 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                            </a>
                        )}
                    </div>
                )}

                <div className="w-full pt-4 border-t border-zinc-100 dark:border-white/5 mt-2 flex items-center justify-between px-4">
                    <div className="flex items-center gap-1.5 text-zinc-500 dark:text-neutral-500">
                        <Users className="h-3.5 w-3.5" />
                        <span className="text-xs font-bold tabular-nums">{(creator.followersCount || 0).toLocaleString()}</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-green-500 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-300">
                        View Profile
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

export default CreatorCard;
