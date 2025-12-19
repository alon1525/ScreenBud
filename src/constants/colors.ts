/**
 * App color palette
 */

export const Colors = {
  // Primary colors
  primary: '#6C5CE7',
  secondary: '#00D2FF',
  
  // Status colors
  success: '#00D084',
  warning: '#FFC312',
  caution: '#FF6B6B',
  error: '#EE5A6F',
  
  // Neutral colors
  dark: '#2D3436',
  gray: '#636E72',
  lightGray: '#DFE6E9',
  white: '#FFFFFF',
  
  // Background colors
  background: '#FFFFFF',
  backgroundDark: '#2D3436',
  cardBackground: '#F8F9FA',
  cardBackgroundDark: '#3D4346',
  
  // Text colors
  text: '#2D3436',
  textSecondary: '#636E72',
  textLight: '#FFFFFF',
  
  // Usage status colors
  usageUnder50: '#00D084', // Green
  usage50to80: '#FFC312', // Yellow
  usage80to100: '#FF6B6B', // Orange
  usageOver100: '#EE5A6F', // Red (but with encouraging message)
  
  // League colors
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
} as const;

/**
 * Get usage status color based on percentage of goal
 */
export function getUsageStatusColor(percentage: number): string {
  if (percentage < 50) return Colors.usageUnder50;
  if (percentage < 80) return Colors.usage50to80;
  if (percentage < 100) return Colors.usage80to100;
  return Colors.usageOver100;
}


