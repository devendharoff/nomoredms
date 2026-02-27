
export interface Resource {
  id: string;
  creatorId: string;
  title: string;
  description?: string;
  category: string;
  tags: string[];
  thumbnail: string;
  date: string;
  url: string;
  isHidden?: boolean;
  status?: 'pending' | 'live' | 'broken';
  health?: 'ok' | 'error';
}

export interface Creator {
  id: string;
  slug: string;
  username: string;
  displayName: string;
  bio: string;
  profilePic: string;
  isVerified: boolean;
  isHidden?: boolean;
  niche?: string;
  followersCount: number;
  socials: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
}

export interface TrendingPrompt {
  id: string;
  type: 'image' | 'video';
  title: string;
  prompt: string;
  thumbnail: string;
  model: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
}

export interface Niche {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  resourceId: string;
  createdAt: string;
}

export interface Click {
  id: string;
  resourceId: string;
  userId?: string;
  ipHash?: string;
  userAgent?: string;
  createdAt: string;
}
export interface Profile {
  id: string;
  email: string | null;
  role: 'user' | 'admin';
  createdAt: string;
}
