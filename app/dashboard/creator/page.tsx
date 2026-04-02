import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import CreatorDashboardContainer from '@/components/CreatorDashboardContainer';
import Link from 'next/link';
import { mapCreator, mapResource } from '@/lib/mappers';

export const revalidate = 0;

export default async function CreatorDashboardPage() {
    const supabase = await createClient();

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect('/creator-login');
    }

    // Try to find the creator profile linked to this user
    let { data: creatorData } = await supabase
        .from('creators')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (!creatorData) {
        // Automatically create a base creator row for the newly signed up user
        const newSlug = `creator-${user.id.substring(0,8)}`;
        const { data: newCreator, error: createError } = await supabase
            .from('creators')
            .insert({
                user_id: user.id,
                slug: newSlug,
                username: newSlug,
                display_name: 'New Creator',
                bio: '',
                profile_pic: '',
                is_hidden: true,
                socials: {}
            })
            .select()
            .single();

        if (createError) {
            console.error('Failed to create creator profile', createError);
            // Handle error state gracefully by showing an empty page or error boundary
            return <div className="p-10 text-white bg-zinc-950 min-h-screen">Failed to initialize creator profile. Ensure you have run the SUPABASE_FIX.sql script.</div>;
        }
        creatorData = newCreator;
    }

    const { data: resourcesData } = await supabase
        .from('resources')
        .select('*')
        .eq('creator_id', creatorData.id)
        .order('created_at', { ascending: false });

    // Fetch categories and niches for dropdowns
    const { data: categoriesData } = await supabase.from('categories').select('*');
    const { data: nichesData } = await supabase.from('niches').select('*');

    const creator = mapCreator(creatorData);
    const resources = (resourcesData || []).map(mapResource);
    const categories = categoriesData || [];
    const niches = nichesData || [];

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <Link href="/" className="fixed top-6 left-6 z-50 p-2 bg-black/50 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/10 transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
            <CreatorDashboardContainer
                creator={creator}
                initialResources={resources}
                categories={categories}
                niches={niches}
            />
        </div>
    );
}
