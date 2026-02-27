-- Create admin_requests table
CREATE TABLE IF NOT EXISTS admin_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create admin_accounts table
CREATE TABLE IF NOT EXISTS admin_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE admin_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_accounts ENABLE ROW LEVEL SECURITY;

-- Policies for admin_requests
-- Users can insert their own requests
CREATE POLICY "Anyone can submit an admin request" ON admin_requests
    FOR INSERT WITH CHECK (true);

-- Only admins (or the system) can view requests - for now, we'll keep it restricted
-- In a real app, you'd use service role or a specific function to view these

-- Policies for admin_accounts
-- Allow authenticated or public select for the login query
CREATE POLICY "Allow public select for login" ON admin_accounts
    FOR SELECT USING (true);

-- Insert master admin seed (Password: NOMOREDMS_2024 for master_admin)
-- Note: In production, use properly hashed passwords.
INSERT INTO admin_accounts (username, password_hash)
VALUES ('master_admin', 'NOMOREDMS_2024')
ON CONFLICT (username) DO NOTHING;
