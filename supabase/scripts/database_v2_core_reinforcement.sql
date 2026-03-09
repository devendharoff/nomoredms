-- ==========================================
-- NOMOREDMS: DATABASE CORE REINFORCEMENT (V2)
-- Goal: Performance, Scalability, and Robust Analytics
-- ==========================================

-- 1. EXTENSIONS
create extension if not exists pg_trgm;

-- 2. NORMALIZATION: CATEGORIES & NICHES
-- This allows us to manage valid categories/niches in one place
create table if not exists categories (
    id uuid primary key default uuid_generate_v4(),
    name text unique not null,
    slug text unique not null,
    description text,
    created_at timestamp with time zone default now()
);

create table if not exists niches (
    id uuid primary key default uuid_generate_v4(),
    name text unique not null,
    slug text unique not null,
    description text,
    created_at timestamp with time zone default now()
);

-- Seed defaults if they don't exist
insert into categories (name, slug) 
values 
    ('AI Tools', 'ai-tools'),
    ('Scripts', 'scripts'),
    ('Prompts', 'prompts'),
    ('Marketing', 'marketing'),
    ('Design', 'design')
on conflict do nothing;

insert into niches (name, slug)
values
    ('Tech/AI', 'tech-ai'),
    ('Business/SaaS', 'business-saas'),
    ('Creative/Design', 'creative-design'),
    ('Personal Brand', 'personal-brand')
on conflict do nothing;

-- 3. USER INTERACTIONS: BOOKMARKS & CLICKS
-- 'Heart' of the website: understanding what users love
create table if not exists bookmarks (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade not null,
    resource_id uuid references resources(id) on delete cascade not null,
    created_at timestamp with time zone default now(),
    unique(user_id, resource_id)
);

create table if not exists clicks (
    id uuid primary key default uuid_generate_v4(),
    resource_id uuid references resources(id) on delete cascade not null,
    user_id uuid references auth.users(id) on delete set null,
    ip_hash text, -- Optional: For anonymous tracking protection
    user_agent text,
    created_at timestamp with time zone default now()
);

-- 4. PERFORMANCE: INDEXES
-- Indexing Foreign Keys
create index if not exists idx_resources_creator_id on resources(creator_id);
create index if not exists idx_resources_category on resources(category);
create index if not exists idx_bookmarks_user_id on bookmarks(user_id);
create index if not exists idx_bookmarks_resource_id on bookmarks(resource_id);
create index if not exists idx_clicks_resource_id on clicks(resource_id);

-- GIN Index for Full Text Search (Pattern Matching)
create index if not exists idx_resources_title_trgm on resources using gin (title gin_trgm_ops);
create index if not exists idx_resources_tags_gin on resources using gin (tags);

-- 5. AUDIT: ADMIN ACTION LOGS
create table if not exists admin_audit_log (
    id uuid primary key default uuid_generate_v4(),
    admin_id uuid references public.profiles(id) not null,
    action text not null, -- 'INSERT', 'UPDATE', 'DELETE'
    table_name text not null,
    record_id uuid not null,
    payload jsonb, -- Store the diff or the new data
    created_at timestamp with time zone default now()
);

-- 6. SECURITY: ROW LEVEL SECURITY (RLS)
-- Standardize RLS for new tables

alter table categories enable row level security;
alter table niches enable row level security;
alter table bookmarks enable row level security;
alter table clicks enable row level security;
alter table admin_audit_log enable row level security;

-- Policies for Categories/Niches (Public View, Admin Manage)
create policy "Anyone can view categories" on categories for select using (true);
create policy "Anyone can view niches" on niches for select using (true);

-- Policies for Bookmarks (User specific)
create policy "Users can view own bookmarks" on bookmarks for select using (auth.uid() = user_id);
create policy "Users can modify own bookmarks" on bookmarks for all using (auth.uid() = user_id);

-- Policies for Clicks (Insert only for users, View for admins)
create policy "Anyone can record a click" on clicks for insert with check (true);
create policy "Admins can view clicks" on clicks for select 
using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Policies for Audit Log (Admins only)
create policy "Admins can view audit logs" on admin_audit_log for select 
using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- 7. SEARCH OPTIMIZATION: GENERATED SEARCH COLUMN
-- Adding a tsvector for high-performance searching
alter table resources add column if not exists fts tsvector 
generated always as (
    to_tsvector('english', title || ' ' || coalesce(description, ''))
) stored;

create index if not exists idx_resources_fts on resources using gin(fts);

-- 8. TRIGGERS: AUTO-SYNC ADMIN LOGS (Optional, but powerful)
-- We can add triggers here later if we want to automatically log every update to resources.
