import { Creator, Resource, TrendingPrompt, Profile } from '@/types';

export function mapCreator(dbCreator: any): Creator {
    const username = dbCreator.username || 'unknown';
    return {
        id: dbCreator.id,
        userId: dbCreator.user_id,
        slug: dbCreator.slug || username.toLowerCase().replace(/\s+/g, '-'),
        username: username,
        displayName: dbCreator.display_name || dbCreator.username || 'Anonymous Creator',
        bio: dbCreator.bio || '',
        profilePic: dbCreator.profile_pic || '',
        isVerified: !!dbCreator.is_verified,
        isHidden: !!dbCreator.is_hidden,
        niche: dbCreator.niche || 'Other',
        followersCount: Number(dbCreator.followers_count || 0),
        socials: dbCreator.socials || {},
    };
}

export function mapResource(dbResource: any): Resource {
    return {
        id: dbResource.id,
        creatorId: dbResource.creator_id,
        title: dbResource.title || 'Untitled Resource',
        description: dbResource.description || '',
        category: dbResource.category || 'Other',
        tags: Array.isArray(dbResource.tags) ? dbResource.tags : [],
        thumbnail: dbResource.thumbnail || '',
        date: dbResource.created_at || new Date().toISOString(),
        url: dbResource.url || '#',
        instagramPostUrl: dbResource.instagram_post_url,
        isHidden: !!dbResource.is_hidden,
        status: dbResource.status || 'pending',
        health: dbResource.health || 'ok',
    };
}

export function mapTrendingPrompt(dbPrompt: any): TrendingPrompt {
    return {
        id: dbPrompt.id,
        type: dbPrompt.type || 'text',
        title: dbPrompt.title || 'Untitled Prompt',
        prompt: dbPrompt.prompt || '',
        thumbnail: dbPrompt.thumbnail || '',
        model: dbPrompt.model || 'Unknown',
        likes: Number(dbPrompt.likes || 0),
    };
}

export function mapProfile(dbProfile: any): Profile {
    return {
        id: dbProfile.id,
        email: dbProfile.email || '',
        role: dbProfile.role || 'user',
        createdAt: dbProfile.created_at || new Date().toISOString(),
    };
}

