'use client';

import React, { useState, memo, useEffect } from 'react';
import { TrendingPrompt } from '@/types';
import { createClient } from '@/utils/supabase/client';
import { mapTrendingPrompt } from '@/lib/mappers';
import { Copy, Check, Image as ImageIcon, Video, Sparkles } from 'lucide-react';

const PromptCard = memo(({ prompt }: { prompt: TrendingPrompt }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-neutral-900/40 transition-all duration-500 hover:border-zinc-300 dark:hover:border-white/20 hover:bg-white dark:hover:bg-neutral-900/60 flex flex-col h-full backdrop-blur-xl">
      <div className="relative w-full overflow-hidden">
        <img
          src={prompt.thumbnail}
          alt={prompt.title}
          loading="lazy"
          decoding="async"
          className="w-full h-auto grayscale-[0.5] group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-110"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/40 to-transparent" />

        <div className="absolute top-4 left-4 flex gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 backdrop-blur-md border border-white/10">
            {prompt.type === 'image' ? <ImageIcon className="h-3 w-3 text-blue-400" /> : <Video className="h-3 w-3 text-orange-400" />}
            <span className="text-[10px] font-black uppercase tracking-widest text-white">{prompt.type} Gen</span>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-black tracking-tighter text-white mb-1 line-clamp-1">{prompt.title}</h3>
          <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{prompt.model}</div>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-4 flex-1">
        <div className="relative flex-1">
          <div className="rounded-2xl bg-zinc-100 dark:bg-black/50 border border-zinc-200 dark:border-white/5 p-4 text-xs font-medium leading-relaxed text-zinc-600 dark:text-neutral-400 italic font-serif">
            "{prompt.prompt}"
          </div>
        </div>

        <button
          onClick={handleCopy}
          className={`group/btn relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl py-3.5 text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-[0.97] ${copied ? 'bg-green-500 text-white' : 'bg-zinc-900 dark:bg-white text-white dark:text-black hover:opacity-90'
            }`}
        >
          {copied ? <><Check className="h-3.5 w-3.5" /> Copied to clipboard</> : <><Copy className="h-3.5 w-3.5" /> Copy Prompt</>}
        </button>
      </div>
    </div >
  );
});

interface TrendingPageProps {
  prompts: TrendingPrompt[];
}

const TrendingPage: React.FC<TrendingPageProps> = ({ prompts: initialPrompts }) => {
  const [prompts, setPrompts] = useState<TrendingPrompt[]>(initialPrompts);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('public:trending_prompts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'trending_prompts' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newPrompt = mapTrendingPrompt(payload.new);
            setPrompts(prev => [newPrompt, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedPrompt = mapTrendingPrompt(payload.new);
            setPrompts(prev => prev.map(p => p.id === updatedPrompt.id ? updatedPrompt : p));
          } else if (payload.eventType === 'DELETE') {
            setPrompts(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="animate-fade-in">
      <section className="mx-auto max-w-7xl px-4 pt-24 pb-12 sm:px-6 relative text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/20 bg-orange-500/5 backdrop-blur-sm text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500 mb-8">
          <Sparkles className="h-3 w-3" /> The Viral Resources
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-white sm:text-7xl mb-6">
          Trending <br />
          <span className="bg-gradient-to-r from-orange-400 via-white to-blue-400 bg-clip-text text-transparent">
            Generation Prompts
          </span>
        </h1>
        <p className="mx-auto max-w-xl text-lg text-zinc-400 font-medium">
          Behind every viral Reel is a high-performance prompt. We've decoded the best of the week.
        </p>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="columns-1 md:columns-2 gap-8 space-y-8">
          {prompts.map((prompt) => (
            <div key={prompt.id} className="break-inside-avoid">
              <PromptCard prompt={prompt} />
            </div>
          ))}
        </div>
        {prompts.length === 0 && (
          <div className="py-40 text-center">
            <p className="text-zinc-500 font-black uppercase tracking-widest italic">The resources are currently empty. Check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendingPage;
