import { api } from "@/lib/api";
import type {
  UserSearchResult,
  UserDetails,
  BannedUsersResponse,
  BanUserResponse,
} from "../types";

export const adminUsersService = {
  searchUsers: async (query: string): Promise<UserSearchResult[]> => {
    if (!query || query.length < 2) return [];
    return await api.get<UserSearchResult[]>(
      `/admin/analytics/users/search?q=${encodeURIComponent(query)}`
    );
  },

  getUserById: async (userId: string): Promise<UserDetails> => {
    return await api.get<UserDetails>(`/admin/analytics/users/${userId}`);
  },

  getBannedUsers: async (limit = 50, offset = 0): Promise<BannedUsersResponse> => {
    return await api.get<BannedUsersResponse>(
      `/admin/analytics/users/banned/list?limit=${limit}&offset=${offset}`
    );
  },

  banUser: async (userId: string, reason: string): Promise<BanUserResponse> => {
    return await api.post<BanUserResponse>(
      `/admin/analytics/users/${userId}/ban`,
      { reason }
    );
  },

  unbanUser: async (userId: string): Promise<{ id: string; isBanned: boolean }> => {
    return await api.post<{ id: string; isBanned: boolean }>(
      `/admin/analytics/users/${userId}/unban`,
      {}
    );
  },
};
