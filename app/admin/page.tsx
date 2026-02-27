import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import AdminDashboardContainer from '@/components/AdminDashboardContainer';
import Link from 'next/link';
import { mapCreator, mapResource, mapTrendingPrompt, mapProfile } from '@/lib/mappers';

export const revalidate = 0;

export default async function AdminPage() {
    const supabase = await createClient();

    const cookieStore = await cookies();
    const isAdminAuthenticated = cookieStore.has('admin_resource_access');

    // HARD FIREWALL: Ensure the separate Admin Cookie exists
    if (!isAdminAuthenticated) {
        redirect('/admin/login');
    }

    // Now fetch system data


    const { data: creatorsData } = await supabase.from('creators').select('*');
    const { data: resourcesData } = await supabase.from('resources').select('*');
    const { data: promptsData } = await supabase.from('trending_prompts').select('*');
    const { data: profilesData } = await supabase.from('profiles').select('*');
    const { data: categoriesData } = await supabase.from('categories').select('*');
    const { data: nichesData } = await supabase.from('niches').select('*');
    const { count: clicksCount } = await supabase.from('clicks').select('*', { count: 'exact', head: true });

    const creators = (creatorsData || []).map(mapCreator);
    const resources = (resourcesData || []).map(mapResource);
    const prompts = (promptsData || []).map(mapTrendingPrompt);
    const profiles = (profilesData || []).map(mapProfile);
    const categories = categoriesData || [];
    const niches = nichesData || [];

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <Link href="/" className="fixed top-6 left-6 z-50 p-2 bg-black/50 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/10 transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
            <AdminDashboardContainer
                initialCreators={creators}
                initialResources={resources}
                initialPrompts={prompts}
                initialProfiles={profiles}
                totalClicks={clicksCount || 0}
                categories={categories}
                niches={niches}
            />
        </div>
    );



}
