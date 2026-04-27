-- 🚀 NOMOREDMS MASTER DATABASE SYNC (ALL-IN-ONE)
-- Run this script in your Supabase SQL Editor to fully initialize your project.

-- =================================================================
-- 0. COLUMN FIXES & TABLE SYNC
-- =================================================================
DO $$ 
BEGIN 
    -- creators table fixes
    IF exists (SELECT 1 FROM information_schema.columns WHERE table_name='creators' AND column_name='followersCount') THEN
        ALTER TABLE creators RENAME COLUMN "followersCount" TO followers_count;
    END IF;
    IF exists (SELECT 1 FROM information_schema.columns WHERE table_name='creators' AND column_name='displayName') THEN
        ALTER TABLE creators RENAME COLUMN "displayName" TO display_name;
    END IF;
    IF exists (SELECT 1 FROM information_schema.columns WHERE table_name='creators' AND column_name='profilePic') THEN
        ALTER TABLE creators RENAME COLUMN "profilePic" TO profile_pic;
    END IF;
    IF exists (SELECT 1 FROM information_schema.columns WHERE table_name='creators' AND column_name='isVerified') THEN
        ALTER TABLE creators RENAME COLUMN "isVerified" TO is_verified;
    END IF;
    IF exists (SELECT 1 FROM information_schema.columns WHERE table_name='creators' AND column_name='isHidden') THEN
        ALTER TABLE creators RENAME COLUMN "isHidden" TO is_hidden;
    END IF;

    -- resources table fixes
    IF exists (SELECT 1 FROM information_schema.columns WHERE table_name='resources' AND column_name='creatorId') THEN
        ALTER TABLE resources RENAME COLUMN "creatorId" TO creator_id;
    END IF;
    IF exists (SELECT 1 FROM information_schema.columns WHERE table_name='resources' AND column_name='isHidden') THEN
        ALTER TABLE resources RENAME COLUMN "isHidden" TO is_hidden;
    END IF;
END $$;


-- =================================================================
-- 1. PROFILES & ROLES SYSTEM
-- =================================================================
create table if not exists profiles (
  id uuid references auth.users not null primary key,
  email text,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- =================================================================
-- 2. CORE DATABASE REINFORCEMENT
-- =================================================================
create extension if not exists pg_trgm;
create extension if not exists "uuid-ossp";

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
    ip_hash text,
    user_agent text,
    created_at timestamp with time zone default now()
);

create table if not exists admin_audit_log (
    id uuid primary key default uuid_generate_v4(),
    admin_id uuid references public.profiles(id) not null,
    action text not null,
    table_name text not null,
    record_id uuid not null,
    payload jsonb,
    created_at timestamp with time zone default now()
);

alter table categories enable row level security;
alter table niches enable row level security;
alter table bookmarks enable row level security;
alter table clicks enable row level security;
alter table admin_audit_log enable row level security;

create policy "Anyone can view categories" on categories for select using (true);
create policy "Anyone can view niches" on niches for select using (true);
create policy "Users can view own bookmarks" on bookmarks for select using (auth.uid() = user_id);
create policy "Users can modify own bookmarks" on bookmarks for all using (auth.uid() = user_id);
create policy "Anyone can record a click" on clicks for insert with check (true);
create policy "Admins can view clicks" on clicks for select 
using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can view audit logs" on admin_audit_log for select 
using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- GIN Index for Full Text Search
create index if not exists idx_resources_title_trgm on resources using gin (title gin_trgm_ops);
create index if not exists idx_resources_tags_gin on resources using gin (tags);

-- Generated FTS column
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resources' AND column_name='fts') THEN
        ALTER TABLE resources ADD COLUMN fts tsvector 
        GENERATED ALWAYS AS (
            to_tsvector('english', title || ' ' || coalesce(description, ''))
        ) STORED;
    END IF;
END $$;

create index if not exists idx_resources_fts on resources using gin(fts);


-- =================================================================
-- 3. AUDIT & TRIGGER SYSTEM
-- =================================================================
create or replace function public.audit_resource_changes()
returns trigger as $$
declare
    admin_id uuid;
begin
    admin_id := auth.uid();
    if admin_id is not null then
        if (tg_op = 'UPDATE') then
            insert into public.admin_audit_log (admin_id, action, table_name, record_id, payload)
            values (admin_id, 'UPDATE', tg_table_name::text, new.id, jsonb_build_object('old', row_to_json(old), 'new', row_to_json(new)));
            return new;
        elsif (tg_op = 'INSERT') then
            insert into public.admin_audit_log (admin_id, action, table_name, record_id, payload)
            values (admin_id, 'INSERT', tg_table_name::text, new.id, row_to_json(new)::jsonb);
            return new;
        elsif (tg_op = 'DELETE') then
            insert into public.admin_audit_log (admin_id, action, table_name, record_id, payload)
            values (admin_id, 'DELETE', tg_table_name::text, old.id, row_to_json(old)::jsonb);
            return old;
        end if;
    end if;
    return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_resource_change on public.resources;
create trigger on_resource_change
    after insert or update or delete on public.resources
    for each row execute procedure public.audit_resource_changes();

drop trigger if exists on_creator_change on public.creators;
create trigger on_creator_change
    after insert or update or delete on public.creators
    for each row execute procedure public.audit_resource_changes();


-- =================================================================
-- 4. STORAGE SETUP
-- =================================================================
-- Use DO block to handle existing buckets safely
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
    INSERT INTO storage.buckets (id, name, public) VALUES ('thumbnails', 'thumbnails', true) ON CONFLICT (id) DO NOTHING;
END $$;

-- Storage Policies
create policy "Authenticated users can upload avatars" on storage.objects for insert to authenticated with check ( bucket_id = 'avatars' );
create policy "Public can view avatars" on storage.objects for select to public using ( bucket_id = 'avatars' );
create policy "Authenticated users can upload thumbnails" on storage.objects for insert to authenticated with check ( bucket_id = 'thumbnails' );
create policy "Public can view thumbnails" on storage.objects for select to public using ( bucket_id = 'thumbnails' );


-- =================================================================
-- 5. ADMIN PORTAL SYSTEM
-- =================================================================
CREATE TABLE IF NOT EXISTS admin_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE admin_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an admin request" ON admin_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select for login" ON admin_accounts FOR SELECT USING (true);

-- Master Admin Seed
INSERT INTO admin_accounts (username, password_hash)
VALUES ('master_admin', 'NOMOREDMS_2024')
ON CONFLICT (username) DO NOTHING;
