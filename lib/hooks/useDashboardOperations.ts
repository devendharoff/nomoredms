import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Resource, Creator } from '@/types';
import { mapResource, mapCreator } from '@/lib/mappers';

/**
 * Standardized Data Pipeline for Dashboard Operations
 * Simplifies saving resources and updating profiles.
 */
export function useDashboardOperations() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    // Pipeline 1: Resource Creation
    const dropResource = async (creatorId: string, resourceData: any) => {
        setLoading(true);
        setError(null);

        try {
            const { data, error: insertError } = await supabase
                .from('resources')
                .insert({
                    creator_id: creatorId,
                    title: resourceData.title,
                    description: resourceData.description,
                    url: resourceData.url,
                    thumbnail: resourceData.thumbnail,
                    instagram_post_url: resourceData.instagramPostUrl,
                    category: resourceData.category,
                    tags: resourceData.tags,
                    status: 'live',
                    health: 'ok',
                    is_hidden: false
                })
                .select()
                .single();

            if (insertError) throw insertError;
            return mapResource(data);
        } catch (e: any) {
            setError(e.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Pipeline 2: Brand Kit Update
    const updateProfile = async (creatorId: string, profileData: any) => {
        setLoading(true);
        setError(null);

        try {
            const { data, error: updateError } = await supabase
                .from('creators')
                .update({
                    display_name: profileData.displayName,
                    slug: profileData.slug,
                    bio: profileData.bio,
                    profile_pic: profileData.profilePic,
                    niche: profileData.niche,
                    socials: profileData.socials
                })
                .eq('id', creatorId)
                .select()
                .single();

            if (updateError) throw updateError;
            return mapCreator(data);
        } catch (e: any) {
            setError(e.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { dropResource, updateProfile, loading, error };
}
