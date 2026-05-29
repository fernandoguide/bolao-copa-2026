export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Team {
  id: number;
  name: string;
  code: string;
  group: string;
  flagUrl?: string;
}

export interface Match {
  id: number;
  homeTeam: Team | null;
  awayTeam: Team | null;
  matchDate: string;
  stage: string;
  homeScore: number | null;
  awayScore: number | null;
  played: boolean;
  matchLabel?: string;
}

export interface Prediction {
  id: number;
  match: Match;
  user?: User;
  homeScore: number;
  awayScore: number;
  points: number;
  createdAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  totalPoints: number;
  totalPredictions: number;
  exactScores: number;
}
