export interface LevelConfig {
  id: number;
  levelNumber: number;
  title: string;
  meadowName: string;
  moleKingName: string;
  moleAlias: string;
  rewardScore: number;
  bitsCount: number;
  minDecimal: number;
  maxDecimal: number;
  timePerRound: number; // seconds for round
  moleStayDuration: number; // seconds a mole stays out of hole
  simultaneousMoles: number; // how many moles peek at the same time
  questionsToPass: number;
  description: string;
  badgeName: string;
  badgeIcon: string;
  difficultyLabel: 'Muy Fácil' | 'Fácil' | 'Media' | 'Avanzada' | 'Difícil' | 'Muy Difícil' | 'Experto' | 'Maestro' | 'Leyenda' | 'Desafío Supremo';
  quote: string;
}

export interface ActiveMole {
  holeIndex: number; // 0 to 8
  answerValue: number;
  isCorrect: boolean;
  state: 'rising' | 'waiting' | 'hit' | 'wrong' | 'hiding';
  appearTime: number;
  timeoutId?: NodeJS.Timeout;
}

export interface Medal {
  id: string;
  level: number;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  tier: 'bronze' | 'copper' | 'iron' | 'silver' | 'nickel' | 'emerald' | 'ruby' | 'sapphire' | 'diamond' | 'legend';
  unlockedAt?: string | null;
}

export interface Question {
  id: string;
  binary: string;
  decimalAnswer: number;
  options: number[];
  bits: number[];
  placeValues: number[];
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  levelReached: number;
  accuracy: number;
  date: string;
  isPlayer?: boolean;
  title: string;
}

export interface PlayerProfile {
  name: string;
  title: string;
  highScore: number;
  highestLevelUnlocked: number;
  completedLevels: number[];
  unlockedMedals: string[];
  totalMolesWhacked: number;
  totalCorrectHits: number;
  fastestHitMs: number;
  soundEnabled: boolean;
}
