import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    return createBrowserClient<Database>(
        url || 'https://placeholder.supabase.co',
        key || 'placeholder'
    )
}
