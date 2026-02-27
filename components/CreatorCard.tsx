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
                            alt={creator.displayName}
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

                <div className="w-full pt-4 border-t border-zinc-100 dark:border-white/5 mt-2 flex items-center justify-between px-4">
                    <div className="flex items-center gap-1.5 text-zinc-500 dark:text-neutral-500">
                        <Users className="h-3.5 w-3.5" />
                        <span className="text-xs font-bold tabular-nums">{creator.followersCount.toLocaleString()}</span>
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
