import { LeaderboardEntry, PlayerProfile } from '../types/game';

const PROFILE_KEY = 'topobinario_player_profile_v1';
const LEADERBOARD_KEY = 'topobinario_leaderboard_v1';

const DEFAULT_PROFILE: PlayerProfile = {
  name: 'Cazatopos Novato',
  title: 'Novato del Huerto',
  highScore: 0,
  highestLevelUnlocked: 1,
  completedLevels: [],
  unlockedMedals: [],
  totalMolesWhacked: 0,
  totalCorrectHits: 0,
  fastestHitMs: 9999,
  soundEnabled: true,
};

const SEED_LEADERBOARD: LeaderboardEntry[] = [
  { id: 'lb-1', name: 'Martillo Veloz', score: 39400, levelReached: 10, accuracy: 98, date: '2026-11-01', title: 'Gran Rey Cazatopos' },
  { id: 'lb-2', name: 'Reina Cazatopos', score: 35100, levelReached: 10, accuracy: 96, date: '2026-11-02', title: 'Maestra del Martillo' },
  { id: 'lb-3', name: 'Topo Cazador Pro', score: 30800, levelReached: 9, accuracy: 95, date: '2026-10-30', title: 'Señor Subterráneo' },
  { id: 'lb-4', name: 'Ojo de Lince', score: 26500, levelReached: 9, accuracy: 94, date: '2026-10-28', title: 'Martillo Relámpago' },
  { id: 'lb-5', name: 'Mazo de Oro', score: 22900, levelReached: 8, accuracy: 92, date: '2026-10-25', title: 'As de la Granja' },
  { id: 'lb-6', name: 'Granjero Juan', score: 18600, levelReached: 7, accuracy: 90, date: '2026-10-22', title: 'Centinela de Roca' },
  { id: 'lb-7', name: 'Tirador del Huerto', score: 14800, levelReached: 6, accuracy: 89, date: '2026-10-20', title: 'Ojo de Águila' },
  { id: 'lb-8', name: 'Amigo de los Topos', score: 11200, levelReached: 5, accuracy: 87, date: '2026-10-18', title: 'Guardián del Roble' },
  { id: 'lb-9', name: 'Vigilante del Prado', score: 7900, levelReached: 4, accuracy: 85, date: '2026-10-15', title: 'Cazador de la Colina' },
  { id: 'lb-10', name: 'Novato del Martillo', score: 4500, levelReached: 2, accuracy: 82, date: '2026-10-12', title: 'Tirador de Martillo' },
];

export function getPlayerProfile(): PlayerProfile {
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    if (data) {
      return { ...DEFAULT_PROFILE, ...JSON.parse(data) };
    }
  } catch (e) {
    console.error('Failed to load profile', e);
  }
  return DEFAULT_PROFILE;
}

export function savePlayerProfile(profile: PlayerProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

export function getGlobalLeaderboard(): LeaderboardEntry[] {
  try {
    const data = localStorage.getItem(LEADERBOARD_KEY);
    if (data) {
      const parsed: LeaderboardEntry[] = JSON.parse(data);
      return parsed.sort((a, b) => b.score - a.score);
    }
  } catch (e) {
    console.error('Failed to load leaderboard', e);
  }
  return SEED_LEADERBOARD;
}

export function submitScoreToLeaderboard(
  playerName: string,
  score: number,
  levelReached: number,
  accuracy: number
): LeaderboardEntry[] {
  const current = getGlobalLeaderboard();
  const newEntry: LeaderboardEntry = {
    id: `entry-${Date.now()}`,
    name: playerName.trim() || 'Cazatopos Anónimo',
    score,
    levelReached,
    accuracy: Math.round(accuracy),
    date: new Date().toISOString().split('T')[0],
    isPlayer: true,
    title:
      levelReached >= 10
        ? 'Gran Rey Cazatopos'
        : levelReached >= 7
        ? 'Martillo Relámpago'
        : levelReached >= 4
        ? 'Cazador Experto'
        : 'Novato del Huerto',
  };

  const updated = [...current, newEntry].sort((a, b) => b.score - a.score).slice(0, 25);
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save leaderboard', e);
  }
  return updated;
}
