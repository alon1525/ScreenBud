/**
 * League system constants
 */

export const LEAGUE_CONFIG = {
  BRONZE: {
    promotionThreshold: 0.20, // Top 20% promote
    demotionThreshold: 0, // No demotion from bronze
    maxPlayers: 50,
    minPlayers: 20,
  },
  SILVER: {
    promotionThreshold: 0.15, // Top 15% promote
    demotionThreshold: 0.20, // Bottom 20% demote
    maxPlayers: 50,
    minPlayers: 20,
  },
  GOLD: {
    promotionThreshold: 0.10, // Top 10% get "Gold Elite"
    demotionThreshold: 0.25, // Bottom 25% demote
    maxPlayers: 50,
    minPlayers: 20,
  },
} as const;

export const LEAGUE_TIERS = ['bronze', 'silver', 'gold'] as const;

export type LeagueTier = typeof LEAGUE_TIERS[number];

/**
 * Get league tier color
 */
export function getLeagueColor(tier: LeagueTier): string {
  switch (tier) {
    case 'bronze':
      return '#CD7F32'; // Bronze color
    case 'silver':
      return '#C0C0C0'; // Silver color
    case 'gold':
      return '#FFD700'; // Gold color
    default:
      return '#6C5CE7'; // Default purple
  }
}

/**
 * Get league tier emoji
 */
export function getLeagueEmoji(tier: LeagueTier): string {
  switch (tier) {
    case 'bronze':
      return '🥉';
    case 'silver':
      return '🥈';
    case 'gold':
      return '🥇';
    default:
      return '🏆';
  }
}


