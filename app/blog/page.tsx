import React from 'react';
import { createClient } from '@/utils/supabase/server';
import Header from '@/components/Header';
import BlogCard from '@/components/BlogCard';
import { BlogPost } from '@/types';
import { Zap, Sparkles } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 3600; // Cache for 1 hour

export default async function BlogPage() {
    const supabase = await createClient();
    const { data: rawPosts } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

    const posts: BlogPost[] = (rawPosts || []).map(p => ({
        id: p.id,
        title: p.title || 'Untitled Post',
        slug: p.slug || '',
        content: p.content || '',
        excerpt: p.excerpt || '',
        category: p.category || 'Uncategorized',
        thumbnailUrl: p.thumbnail_url || undefined,
        isPublished: p.is_published ?? false,
        publishedAt: p.published_at || null,
        createdAt: p.created_at || new Date().toISOString(),
        authorId: p.author_id || undefined
    }));

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white font-sans tracking-tight">
            {/* Simple Header for nested pages if not using the main one */}
            <div className="border-b border-zinc-100 dark:border-white/10 bg-white/80 dark:bg-black/60 backdrop-blur-md sticky top-0 z-50">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                    <Link href="/" className="flex items-center gap-2 group">
                        <Zap className="h-6 w-6 text-zinc-950 dark:text-white fill-current transition-transform group-hover:scale-110" />
                        <span className="text-xl font-black tracking-tighter text-zinc-950 dark:text-white uppercase">NOMOREDMS</span>
                    </Link>
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Hub Insights</div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
                <div className="max-w-3xl mb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-white/60 mb-8">
                        <Sparkles className="h-3.5 w-3.5 text-green-500" />
                        Official Hub Blog
                    </div>
                    <h1 className="text-5xl sm:text-7xl font-black tracking-tighter uppercase mb-8 leading-[0.9]">
                        Insights and <br />
                        <span className="text-zinc-300 dark:text-zinc-800">Site Updates.</span>
                    </h1>
                    <p className="text-lg sm:text-xl font-medium text-zinc-500 max-w-xl">
                        Everything you need to know about navigating the new creator era. Tutorials, news, and official announcements.
                    </p>
                </div>

                {posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post) => (
                            <BlogCard key={post.id} post={post} />
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center border-t border-zinc-100 dark:border-white/5">
                        <p className="text-zinc-500 font-black uppercase tracking-widest">No posts published yet.</p>
                    </div>
                )}
            </main>

            <footer className="border-t border-zinc-100 dark:border-white/5 py-20 text-center bg-zinc-50/50 dark:bg-zinc-900/20">
                <Link href="/" className="mb-8 inline-flex items-center gap-3 group">
                    <Zap className="h-6 w-6 text-zinc-950 dark:text-white fill-current" />
                    <span className="text-xl font-black tracking-tighter uppercase">NOMOREDMS</span>
                </Link>
                <div className="flex justify-center gap-8 mb-8 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    <Link href="/privacy-policy" className="hover:text-zinc-950 dark:hover:text-white transition-colors">Privacy</Link>
                    <Link href="/terms-of-service" className="hover:text-zinc-950 dark:hover:text-white transition-colors">Terms</Link>
                    <Link href="/creator-login" className="hover:text-zinc-950 dark:hover:text-white transition-colors">Creator Hub</Link>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">NOMOREDMS &copy; 2024</p>
            </footer>
        </div>
    );
}
