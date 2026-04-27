import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Zap, ChevronLeft, Calendar, Tag, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const revalidate = 0;

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: post } = await (supabase
        .from('blog_posts')
        .select(`
            *,
            author:creators(display_name, profile_pic)
        `)
        .eq('slug', slug)
        .eq('is_published', true)
        .single() as any);

    if (!post) {
        notFound();
    }

    // Brute-force fix for data that was double-escaped during insertion
    let cleanContent = (post.content || '')
        .replace(/\\n/g, '\n')
        .replace(/â€“/g, '—')
        .replace(/â€™/g, "'");

    // Remove redundant primary heading if it matches the title
    if (cleanContent.startsWith('# ')) {
        const lines = cleanContent.split('\n');
        lines.shift(); // Remove the # Heading line
        cleanContent = lines.join('\n').trim();
    }

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white font-sans tracking-tight">
            <div className="border-b border-zinc-100 dark:border-white/10 bg-white/80 dark:bg-black/60 backdrop-blur-md sticky top-0 z-50">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                    <Link href="/blog" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors group">
                        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Back to Insights
                    </Link>
                    <Link href="/" className="flex items-center gap-2 group">
                        <Zap className="h-5 w-5 text-zinc-950 dark:text-white fill-current transition-transform group-hover:scale-110" />
                        <span className="text-lg font-black tracking-tighter text-zinc-950 dark:text-white uppercase hidden sm:inline">NOMOREDMS</span>
                    </Link>
                </div>
            </div>

            <article className="max-w-3xl mx-auto px-4 sm:px-6 py-24 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <header className="mb-20 text-center">
                    <div className="flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-green-600 mb-8">
                        <Tag className="h-3 w-3" />
                        {post.category}
                    </div>
                    <h1 className="text-5xl sm:text-7xl font-black tracking-tighter uppercase mb-10 leading-[0.85] text-balance">
                        {post.title}
                    </h1>
                    
                    <div className="flex flex-wrap items-center justify-center gap-8 pt-10 border-t border-zinc-100 dark:border-white/5">
                        <div className="flex items-center gap-4 text-left">
                            {post.author?.profile_pic ? (
                                <img src={post.author.profile_pic} className="h-12 w-12 rounded-full border border-zinc-200 dark:border-white/10 object-cover shadow-sm" alt="" />
                            ) : (
                                <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-white/10">
                                    <Zap className="h-5 w-5 text-zinc-400" />
                                </div>
                            )}
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">Written by</div>
                                <div className="text-base font-bold tracking-tight">{post.author?.display_name || 'Hub Editor'}</div>
                            </div>
                        </div>

                        <div className="h-10 w-px bg-zinc-100 dark:bg-white/5 hidden sm:block" />

                        <div className="flex items-center gap-4 text-left">
                            <div className="p-3 rounded-full bg-zinc-100 dark:bg-white/5 text-zinc-500">
                                <Calendar className="h-4 w-4" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">Published</div>
                                <div className="text-base font-bold tracking-tight">{new Date(post.published_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                            </div>
                        </div>
                    </div>
                </header>

                {post.thumbnail_url && (
                    <div className="aspect-video rounded-[3rem] overflow-hidden mb-20 border border-zinc-100 dark:border-white/5 shadow-2xl shadow-black/5">
                        <img src={post.thumbnail_url || ''} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" alt="" />
                    </div>
                )}

                <div className="prose prose-zinc dark:prose-invert prose-lg max-w-none 
                    prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-headings:mt-16 prose-headings:mb-8
                    prose-p:font-medium prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-p:leading-relaxed prose-p:mb-8
                    prose-strong:text-zinc-950 dark:prose-strong:text-white prose-strong:font-bold
                    prose-code:text-green-600 prose-code:bg-green-50 dark:prose-code:bg-green-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                    prose-blockquote:border-l-4 prose-blockquote:border-green-500 prose-blockquote:bg-zinc-50 dark:prose-blockquote:bg-white/5 prose-blockquote:py-4 prose-blockquote:px-8 prose-blockquote:rounded-r-2xl prose-blockquote:italic prose-blockquote:text-zinc-700 dark:prose-blockquote:text-zinc-300">
                    <ReactMarkdown>{cleanContent}</ReactMarkdown>
                </div>

                <footer className="mt-20 pt-12 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                            <Share2 className="h-3.5 w-3.5" />
                            Share Article
                        </button>
                    </div>
                    
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        &copy; 2024 NOMOREDMS
                    </div>
                </footer>
            </article>

            {/* Newsletter / CTA Section */}
            <section className="bg-zinc-50 dark:bg-zinc-900/30 py-24 border-y border-zinc-100 dark:border-white/5">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                    <h2 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase mb-6">Build the platform.</h2>
                    <p className="text-zinc-500 font-medium mb-10 max-w-md mx-auto italic pb-5">Stop begging for links. Start building your repository today.</p>
                    <Link href="/creator-login" className="px-10 py-5 bg-green-500 hover:bg-green-600 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-2xl shadow-green-500/20 transition-all inline-block hover:scale-105 active:scale-95">
                        Apply as Creator
                    </Link>
                </div>
            </section>
        </div>
    );
}
