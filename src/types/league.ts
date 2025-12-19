/**
 * League and competition TypeScript types
 */

export interface League {
  id: string;
  tier: 'bronze' | 'silver' | 'gold';
  weekStart: string; // YYYY-MM-DD (Monday)
  weekEnd: string; // YYYY-MM-DD (Sunday)
  players: LeaguePlayer[];
  playerCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaguePlayer {
  userId: string;
  username: string;
  avatar: string;
  totalPoints: number;
  totalMinutes: number;
  rank: number;
  previousRank?: number;
  perfectDays: number;
  isFriend?: boolean;
  isCurrentUser?: boolean;
}

export interface LeagueAssignment {
  userId: string;
  leagueId: string;
  tier: 'bronze' | 'silver' | 'gold';
  weekStart: string;
  assignedAt: Date;
  reason: 'new_user' | 'promotion' | 'demotion' | 'maintained';
}

export interface LeagueRules {
  bronze: {
    promotionThreshold: number; // top X%
    demotionThreshold: number; // bottom X% (none for bronze)
    maxPlayers: number;
  };
  silver: {
    promotionThreshold: number;
    demotionThreshold: number;
    maxPlayers: number;
  };
  gold: {
    promotionThreshold: number; // top X% get "Gold Elite"
    demotionThreshold: number;
    maxPlayers: number;
  };
}


