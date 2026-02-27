import { createClient } from '@/utils/supabase/server';
import HomeContent from '@/components/HomeContent';
import { MOCK_CREATORS, MOCK_RESOURCES } from '@/constants';
import { mapCreator, mapResource, mapTrendingPrompt } from '@/lib/mappers';

export const revalidate = 0; // Disable static optimization for now (dynamic data)

export default async function Home({ searchParams }: { searchParams: Promise<{ launch?: string }> }) {
    const supabase = await createClient();

    const { data: creatorsData } = await supabase.from('creators').select('*');
    const { data: resourcesData } = await supabase.from('resources').select('*');

    // Fallback to mocks if DB fails or is empty (safety net)
    const creatorsRaw = (creatorsData && creatorsData.length > 0) ? creatorsData : [];
    const resourcesRaw = (resourcesData && resourcesData.length > 0) ? resourcesData : [];

    const creators = creatorsRaw.length > 0 ? creatorsRaw.map(mapCreator) : MOCK_CREATORS;
    const resources = resourcesRaw.length > 0 ? resourcesRaw.map(mapResource) : MOCK_RESOURCES;

    const params = await searchParams;

    return (
        <HomeContent
            initialCreators={creators}
            initialResources={resources}
            launchedByParams={params?.launch === 'true'}
        />
    );
}
