'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import AdminDashboard from './AdminDashboard';
import { Creator, Resource, TrendingPrompt, Profile } from '@/types';
import { mapCreator, mapResource, mapTrendingPrompt } from '@/lib/mappers';
import { useEffect } from 'react';

interface StatsProps {
    initialCreators: Creator[];
    initialResources: Resource[];
    initialPrompts: TrendingPrompt[];
    initialProfiles: Profile[];
    totalClicks: number;
    categories: any[];
    niches: any[];
}

export default function AdminDashboardContainer({
    initialCreators,
    initialResources,
    initialPrompts,
    initialProfiles,
    totalClicks,
    categories: initialCategories,
    niches: initialNiches
}: StatsProps) {
    const [creators, setCreators] = useState<Creator[]>(initialCreators);
    const [resources, setResources] = useState<Resource[]>(initialResources);
    const [prompts, setPrompts] = useState<TrendingPrompt[]>(initialPrompts);
    const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
    const [categories, setCategories] = useState<any[]>(initialCategories);
    const [niches, setNiches] = useState<any[]>(initialNiches);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [adminRequests, setAdminRequests] = useState<any[]>([]);


    const supabase = createClient();

    // Real-time Subscriptions for Admin (See changes from other sessions/admins)
    useEffect(() => {
        // Resources
        const resourcesChannel = supabase
            .channel('admin:resources')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'resources' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    const mapped = mapResource(payload.new);
                    setResources(prev => [mapped, ...prev.filter(r => r.id !== mapped.id)]);
                } else if (payload.eventType === 'UPDATE') {
                    const mapped = mapResource(payload.new);
                    setResources(prev => prev.map(r => r.id === mapped.id ? mapped : r));
                } else if (payload.eventType === 'DELETE') {
                    setResources(prev => prev.filter(r => r.id !== payload.old.id));
                }
            })
            .subscribe();

        // Creators
        const creatorsChannel = supabase
            .channel('admin:creators')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'creators' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    const mapped = mapCreator(payload.new);
                    setCreators(prev => [mapped, ...prev.filter(c => c.id !== mapped.id)]);
                } else if (payload.eventType === 'UPDATE') {
                    const mapped = mapCreator(payload.new);
                    setCreators(prev => prev.map(c => c.id === mapped.id ? mapped : c));
                } else if (payload.eventType === 'DELETE') {
                    setCreators(prev => prev.filter(c => c.id !== payload.old.id));
                }
            })
            .subscribe();

        // Prompts
        const promptsChannel = supabase
            .channel('admin:prompts')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'trending_prompts' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    const mapped = mapTrendingPrompt(payload.new);
                    setPrompts(prev => [mapped, ...prev.filter(p => p.id !== mapped.id)]);
                } else if (payload.eventType === 'UPDATE') {
                    const mapped = mapTrendingPrompt(payload.new);
                    setPrompts(prev => prev.map(p => p.id === mapped.id ? mapped : p));
                } else if (payload.eventType === 'DELETE') {
                    setPrompts(prev => prev.filter(p => p.id !== payload.old.id));
                }
            })
            .subscribe();

        // Audit Logs
        const auditChannel = supabase
            .channel('admin:audit')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'admin_audit_log' }, (payload) => {
                setAuditLogs(prev => [payload.new, ...prev].slice(0, 50));
            })
            .subscribe();

        // Fetch Audit Logs
        supabase.from('admin_audit_log').select('*').order('created_at', { ascending: false }).limit(50).then(({ data }) => {
            if (data) setAuditLogs(data);
        });

        // Fetch Admin Requests
        supabase.from('admin_requests').select('*').order('created_at', { ascending: false }).then(({ data }) => {
            if (data) setAdminRequests(data);
        });

        return () => {
            supabase.removeChannel(resourcesChannel);
            supabase.removeChannel(creatorsChannel);
            supabase.removeChannel(promptsChannel);
            supabase.removeChannel(auditChannel);
        };
    }, []);

    const handleUploadFile = async (file: File, bucket: 'avatars' | 'thumbnails') => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
            return data.publicUrl;
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file. Check console for details.');
            return null;
        }
    };

    const handleAddResource = async (newR: Partial<Resource>) => {
        // Optimistic update
        const tempId = Math.random().toString(36).substr(2, 9);
        const resource: Resource = {
            id: tempId,
            creatorId: newR.creatorId || '',
            title: newR.title || 'Untitled',
            category: newR.category || 'AI Tools',
            categoryId: newR.categoryId,
            tags: newR.tags || [],
            thumbnail: newR.thumbnail || 'https://picsum.photos/600/400',
            date: new Date().toISOString(),
            url: newR.url || '#',
            status: 'live',
            health: 'ok',
            description: newR.description,
            ...newR
        } as Resource;

        setResources(prev => [resource, ...prev]);

        // DB Insert
        const { data, error } = await supabase.from('resources').insert([{
            creator_id: resource.creatorId,
            title: resource.title,
            description: resource.description,
            category: resource.category,
            category_id: resource.categoryId,
            tags: resource.tags,
            thumbnail: resource.thumbnail,
            url: resource.url,
            status: resource.status,
            health: resource.health,
            is_hidden: false
        }]).select().single();

        if (data) {
            const mapped = mapResource(data);
            setResources(prev => prev.map(r => r.id === tempId ? mapped : r));
        } else if (error) {
            console.error('Error adding resource:', error);
            setResources(prev => prev.filter(r => r.id !== tempId));
            alert(`Error: ${error.message}`);
        }
    };

    const handleUpdateResource = async (id: string, updates: Partial<Resource>) => {
        setResources(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));

        const dbUpdates: any = {};
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.category !== undefined) dbUpdates.category = updates.category;
        if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId;
        if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
        if (updates.thumbnail !== undefined) dbUpdates.thumbnail = updates.thumbnail;
        if (updates.url !== undefined) dbUpdates.url = updates.url;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.health !== undefined) dbUpdates.health = updates.health;
        if (updates.isHidden !== undefined) dbUpdates.is_hidden = updates.isHidden;

        const { error } = await supabase.from('resources').update(dbUpdates).eq('id', id);
        if (error) {
            console.error('Error updating resource:', {
                message: error.message,
                code: error.code,
                details: error.details
            });
        }
    };

    const handleDeleteResource = async (id: string) => {
        setResources(prev => prev.filter(r => r.id !== id));
        await supabase.from('resources').delete().eq('id', id);
    };

    const handleToggleResourceVisibility = async (id: string) => {
        const resource = resources.find(r => r.id === id);
        if (!resource) return;
        const newVal = !resource.isHidden;
        handleUpdateResource(id, { isHidden: newVal });
    };

    // Creators
    const handleAddCreator = async (newC: Partial<Creator>) => {
        const tempId = Math.random().toString(36).substr(2, 9);
        const creator = { ...newC, id: tempId, followersCount: 0, socials: {}, isVerified: false, isHidden: false } as Creator;
        setCreators(prev => [creator, ...prev]);

        const { data, error } = await supabase.from('creators').insert([{
            slug: (newC.displayName || 'new-creator').toLowerCase().replace(/\s+/g, '-'),
            username: newC.username || 'unknown',
            display_name: newC.displayName || 'Anonymous Creator',
            niche: newC.niche || 'Other',
            niche_id: newC.nicheId,
            profile_pic: newC.profilePic || '',
            bio: newC.bio || '',
            is_hidden: false,
            is_verified: false,
            followers_count: 0
        }]).select().single();

        if (data) {
            setCreators(prev => prev.map(c => c.id === tempId ? { ...c, id: data.id } : c));
        } else if (error) {
            console.error('Error adding creator:', {
                message: error.message,
                code: error.code,
                details: error.details
            });
            setCreators(prev => prev.filter(c => c.id !== tempId));
        }
    };

    const handleUpdateCreator = async (id: string, updates: Partial<Creator>) => {
        setCreators(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));

        const dbUpdates: any = {};
        if (updates.username !== undefined) dbUpdates.username = updates.username;
        if (updates.displayName !== undefined) dbUpdates.display_name = updates.displayName;
        if (updates.niche !== undefined) dbUpdates.niche = updates.niche;
        if (updates.nicheId !== undefined) dbUpdates.niche_id = updates.nicheId;
        if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
        if (updates.profilePic !== undefined) dbUpdates.profile_pic = updates.profilePic;
        if (updates.isVerified !== undefined) dbUpdates.is_verified = updates.isVerified;
        if (updates.isHidden !== undefined) dbUpdates.is_hidden = updates.isHidden;
        if (updates.followersCount !== undefined) dbUpdates.followers_count = updates.followersCount;
        if (updates.socials !== undefined) dbUpdates.socials = updates.socials;

        await supabase.from('creators').update(dbUpdates).eq('id', id);
    };

    const handleDeleteCreator = async (id: string) => {
        setCreators(prev => prev.filter(c => c.id !== id));
        const { error } = await supabase.from('creators').delete().eq('id', id);
        if (error) {
            console.error('Error deleting creator:', error);
            alert('Error deleting creator. Check console.');
        }
    };
    // Prompts
    const handleAddPrompt = async (newP: Partial<TrendingPrompt>) => {
        const tempId = Math.random().toString(36).substr(2, 9);
        const prompt = { ...newP, id: tempId } as TrendingPrompt;
        setPrompts(prev => [prompt, ...prev]);

        const { data, error } = await supabase.from('trending_prompts').insert([newP as any]).select().single();
        if (data) {
            setPrompts(prev => prev.map(p => p.id === tempId ? { ...p, id: data.id } : p));
        } else if (error) {
            console.error('Error adding prompt:', {
                message: error.message,
                code: error.code,
                details: error.details
            });
            setPrompts(prev => prev.filter(p => p.id !== tempId));
        }
    };

    const handleDeletePrompt = async (id: string) => {
        setPrompts(prev => prev.filter(p => p.id !== id));
        await supabase.from('trending_prompts').delete().eq('id', id);
    };

    const handleUpdateProfile = async (id: string, updates: Partial<Profile>) => {
        setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
        const { error } = await supabase.from('profiles').update(updates).eq('id', id);
        if (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile role.');
        }
    };

    const handleAddCategory = async (name: string) => {
        const slug = name.toLowerCase().replace(/\s+/g, '-');
        const { data, error } = await supabase.from('categories').insert([{ name, slug }]).select().single();
        if (data) setCategories(prev => [...prev, data]);
        else if (error) alert(error.message);
    };

    const handleAddNiche = async (name: string) => {
        const slug = name.toLowerCase().replace(/\s+/g, '-');
        const { data, error } = await supabase.from('niches').insert([{ name, slug }]).select().single();
        if (data) setNiches(prev => [...prev, data]);
        else if (error) alert(error.message);
    };

    const handleUpdateAdminRequest = async (id: string, status: 'approved' | 'rejected') => {
        const { error } = await supabase.from('admin_requests').update({ status }).eq('id', id);
        if (error) alert(error.message);
        else setAdminRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    };

    const handleBulkUpload = async (type: 'creators' | 'resources', data: any[]) => {
        if (type === 'creators') {
            const formattedData = data.map(item => ({
                username: item.username || item.username,
                display_name: item.display_name || item.displayName,
                niche: item.niche,
                bio: item.bio,
                profile_pic: item.profile_pic || item.profilePic || '',
                slug: item.slug || (item.display_name || item.displayName || '').toLowerCase().replace(/\s+/g, '-'),
                is_verified: false,
                is_hidden: false
            }));

            const { data: inserted, error } = await supabase.from('creators').insert(formattedData).select();
            if (error) {
                console.error('Bulk Creator Error:', error);
                alert('Error uploading creators. View console.');
            } else if (inserted) {
                const mapped = inserted.map(mapCreator);
                setCreators(prev => [...mapped, ...prev]);
                alert(`Successfully injected ${inserted.length} creators.`);
            }
        } else {
            const formattedData = data.map(item => ({
                creator_id: item.creator_id || item.creatorId,
                title: item.title,
                description: item.description,
                url: item.url,
                category: item.category,
                thumbnail: item.thumbnail || '',
                status: 'pending',
                health: 'ok',
                tags: typeof item.tags === 'string' ? item.tags.split(',').map((t: string) => t.trim()) : (item.tags || []),
                is_hidden: true
            }));

            const { data: inserted, error } = await supabase.from('resources').insert(formattedData).select();
            if (error) {
                console.error('Bulk Resource Error:', error);
                alert('Error uploading resources. View console.');
            } else if (inserted) {
                const mapped = inserted.map(mapResource);
                setResources(prev => [...mapped, ...prev]);
                alert(`Successfully injected ${inserted.length} resources into Staging.`);
            }
        }
    };

    return (
        <AdminDashboard
            creators={creators}
            resources={resources}
            trendingPrompts={prompts}
            profiles={profiles}
            totalClicks={totalClicks}
            dbCategories={categories}
            dbNiches={niches}
            auditLogs={auditLogs}
            adminRequests={adminRequests}
            onAddResource={handleAddResource}
            onAddCreator={handleAddCreator}
            onAddPrompt={handleAddPrompt}
            onDeleteResource={handleDeleteResource}
            onDeleteCreator={handleDeleteCreator}
            onDeletePrompt={handleDeletePrompt}
            onToggleResourceVisibility={handleToggleResourceVisibility}
            onUpdateResource={handleUpdateResource}
            onUpdateCreator={handleUpdateCreator}
            onUploadFile={handleUploadFile}
            onUpdateProfile={handleUpdateProfile}
            onBulkUpload={handleBulkUpload}
            onAddCategory={handleAddCategory}
            onAddNiche={handleAddNiche}
            onUpdateAdminRequest={handleUpdateAdminRequest}
        />
    );

}
