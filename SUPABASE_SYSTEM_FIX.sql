-- Fixes for the high-level database management system
BEGIN;

-- 1. Ensure all auth users have profiles
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'user'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 2. Fix creators table
-- Ensure user_id column exists (for ownership)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='creators' AND column_name='user_id') THEN
        ALTER TABLE creators ADD COLUMN user_id uuid REFERENCES auth.users(id);
    END IF;

    -- Ensure niche_id column exists (for relation)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='creators' AND column_name='niche_id') THEN
        ALTER TABLE creators ADD COLUMN niche_id uuid REFERENCES niches(id);
    END IF;
END $$;

-- 3. Fix resources table
-- Ensure category_id column exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resources' AND column_name='category_id') THEN
        ALTER TABLE resources ADD COLUMN category_id uuid REFERENCES categories(id);
    END IF;
END $$;

COMMIT;
