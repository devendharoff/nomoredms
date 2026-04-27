'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Creator, Resource } from '@/types';
import ProfileHero from '@/components/ProfileHero';
import ResourceCard from '@/components/ResourceCard';
import LinkGateModal from '@/components/LinkGateModal';
import MobileNav from '@/components/MobileNav';
import MobileSearchOverlay from '@/components/MobileSearchOverlay';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { mapResource } from '@/lib/mappers';
import { useEffect } from 'react';

interface CreatorProfileContentProps {
    creator: Creator;
    initialResources: Resource[];
}

export default function CreatorProfileContent({
    creator,
    initialResources
}: CreatorProfileContentProps) {
    const router = useRouter();
    const [resources, setResources] = useState<Resource[]>(initialResources);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

    // Real-time Subscriptions for this creator's resources
    useEffect(() => {
        const supabase = createClient();

        const channel = supabase
            .channel(`public:resources:creator:${creator.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'resources',
                    filter: `creator_id=eq.${creator.id}`
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const newResource = mapResource(payload.new);
                        // Only add if live and not hidden
                        if (newResource.status === 'live' && !newResource.isHidden) {
                            setResources(prev => [newResource, ...prev]);
                        }
                    } else if (payload.eventType === 'UPDATE') {
                        const updatedResource = mapResource(payload.new);
                        if (updatedResource.status === 'live' && !updatedResource.isHidden) {
                            setResources(prev => {
                                const exists = prev.find(r => r.id === updatedResource.id);
                                if (exists) {
                                    return prev.map(r => r.id === updatedResource.id ? updatedResource : r);
                                } else {
                                    return [updatedResource, ...prev];
                                }
                            });
                        } else {
                            // Hide if status changed or isHidden is true
                            setResources(prev => prev.filter(r => r.id !== updatedResource.id));
                        }
                    } else if (payload.eventType === 'DELETE') {
                        setResources(prev => prev.filter(r => r.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [creator.id]);

    const handleNavigateCreator = (slug: string) => {
        if (slug !== creator.slug) {
            router.push(`/creator/${slug}`);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <Link href="/" className="fixed top-6 left-6 z-50 p-2 bg-black/50 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/10 transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>

            <ProfileHero
                creator={creator}
                resources={resources}
            />

            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 pb-24">
                    {resources.map(r => (
                        <ResourceCard
                            key={r.id}
                            resource={r}
                            creator={creator}
                            onNavigateCreator={handleNavigateCreator}
                        />
                    ))}
                </div>
            </div>

            <MobileNav onOpenSearch={() => setIsMobileSearchOpen(true)} />
            <MobileSearchOverlay 
                isOpen={isMobileSearchOpen} 
                onClose={() => setIsMobileSearchOpen(false)} 
                onSearch={(term) => router.push(`/?search=${encodeURIComponent(term)}`)} 
                currentSearchTerm=""
            />
        </div>
    );
}
