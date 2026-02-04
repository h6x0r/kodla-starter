// User Search Result
export interface UserSearchResult {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isPremium: boolean;
  isBanned: boolean;
  bannedAt: string | null;
  bannedReason: string | null;
  createdAt: string;
  lastActivityAt: string | null;
  submissionsCount: number;
  coursesCount: number;
}

// User Details (full profile)
export interface UserDetails extends UserSearchResult {
  bannedBy: string | null;
  xp: number;
  level: number;
  currentStreak: number;
  bugReportsCount: number;
}

// Banned Users Response
export interface BannedUsersResponse {
  users: Array<{
    id: string;
    email: string;
    name: string | null;
    bannedAt: string;
    bannedReason: string | null;
    bannedBy: string | null;
    createdAt: string;
  }>;
  total: number;
}

// Ban User Response
export interface BanUserResponse {
  id: string;
  email: string;
  name: string | null;
  isBanned: boolean;
  bannedAt: string;
  bannedReason: string;
}
