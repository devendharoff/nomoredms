import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

/**
 * Robust Supabase Realtime Hook
 * Handles INSERT, UPDATE, and DELETE events for a given table.
 */
export function useRealtime<T extends { id: string | number }>(
    table: string,
    initialData: T[],
    mapper: (dbRow: any) => T,
    options: {
        event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
        onEvent?: (payload: any) => void;
        shouldUpdate?: (item: T) => boolean;
    } = {}
) {
    const [data, setData] = useState<T[]>(initialData);
    const supabase = createClient();

    useEffect(() => {
        const channel = supabase
            .channel(`realtime:${table}`)
            .on(
                'postgres_changes',
                { event: options.event || '*', schema: 'public', table },
                (payload) => {
                    if (options.onEvent) options.onEvent(payload);

                    const { eventType, new: newRow, old: oldRow } = payload;

                    if (eventType === 'INSERT') {
                        const newItem = mapper(newRow);
                        if (options.shouldUpdate && !options.shouldUpdate(newItem)) return;
                        
                        setData((prev) => {
                            if (prev.some(item => item.id === newItem.id)) return prev;
                            return [newItem, ...prev];
                        });
                    } else if (eventType === 'UPDATE') {
                        const updatedItem = mapper(newRow);
                        setData((prev) => {
                            const exists = prev.some(item => item.id === updatedItem.id);
                            
                            // If it didn't exist but is now valid (e.g. status changed to live), add it
                            if (!exists) {
                                if (options.shouldUpdate && !options.shouldUpdate(updatedItem)) return prev;
                                return [updatedItem, ...prev];
                            }
                            
                            // If it exists but is no longer valid (e.g. marked as hidden), remove it
                            if (options.shouldUpdate && !options.shouldUpdate(updatedItem)) {
                                return prev.filter(item => item.id !== updatedItem.id);
                            }
                            
                            return prev.map((item) => (item.id === updatedItem.id ? updatedItem : item));
                        });
                    } else if (eventType === 'DELETE') {
                        setData((prev) => prev.filter((item) => item.id !== oldRow.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [table, mapper, options.event, options.shouldUpdate]);

    return [data, setData] as const;
}
