/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GAME_LEVELS } from './data/levels';
import { LevelConfig, PlayerProfile } from './types/game';
import { getPlayerProfile, savePlayerProfile, submitScoreToLeaderboard } from './utils/storage';
import { Header } from './components/Header';
import { WhackAMoleArena } from './components/WhackAMoleArena';
import { LevelSelectModal } from './components/LevelSelectModal';
import { MedalsModal } from './components/MedalsModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { BinaryTutorModal } from './components/BinaryTutorModal';
import { DuelResultModal } from './components/DuelResultModal';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  // Player state loaded from storage
  const [profile, setProfile] = useState<PlayerProfile>(() => getPlayerProfile());

  // Current level
  const [currentLevel, setCurrentLevel] = useState<LevelConfig>(() => {
    const savedLvl = GAME_LEVELS.find((l) => l.levelNumber === profile.highestLevelUnlocked);
    return savedLvl || GAME_LEVELS[0];
  });

  // Modal visibility states
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [showMedals, setShowMedals] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showTutor, setShowTutor] = useState(false);

  // Result modal state
  const [gameResult, setGameResult] = useState<{
    isOpen: boolean;
    isVictory: boolean;
    scoreEarned: number;
    correctCount: number;
    fastestShotSeconds: number;
    totalQuestions: number;
  }>({
    isOpen: false,
    isVictory: false,
    scoreEarned: 0,
    correctCount: 0,
    fastestShotSeconds: 0,
    totalQuestions: 0,
  });

  // Save profile updates to localStorage
  useEffect(() => {
    savePlayerProfile(profile);
  }, [profile]);

  // Handle player finishing a level
  const handleGameFinish = (
    victory: boolean,
    stats: {
      scoreEarned: number;
      correctCount: number;
      fastestHitSeconds: number;
      totalQuestions: number;
    }
  ) => {
    if (victory) {
      setProfile((prev) => {
        const completedLevels = Array.from(new Set([...prev.completedLevels, currentLevel.levelNumber]));
        const nextLevelNum = Math.min(10, currentLevel.levelNumber + 1);
        const highestLevelUnlocked = Math.max(prev.highestLevelUnlocked, nextLevelNum);
        const newHighScore = prev.highScore + stats.scoreEarned;

        // Auto submit to leaderboard
        const accuracy = (stats.correctCount / Math.max(1, stats.totalQuestions)) * 100;
        submitScoreToLeaderboard(prev.name, newHighScore, currentLevel.levelNumber, accuracy);

        return {
          ...prev,
          completedLevels,
          highestLevelUnlocked,
          highScore: newHighScore,
          totalMolesWhacked: prev.totalMolesWhacked + stats.correctCount,
          totalCorrectHits: prev.totalCorrectHits + stats.correctCount,
          fastestHitMs: Math.min(prev.fastestHitMs, Math.round(stats.fastestHitSeconds * 1000)),
        };
      });
    }

    setGameResult({
      isOpen: true,
      isVictory: victory,
      scoreEarned: stats.scoreEarned,
      correctCount: stats.correctCount,
      fastestShotSeconds: stats.fastestHitSeconds,
      totalQuestions: stats.totalQuestions,
    });
  };

  // Move to next level
  const handleNextLevel = () => {
    setGameResult((prev) => ({ ...prev, isOpen: false }));
    const nextIdx = GAME_LEVELS.findIndex((l) => l.levelNumber === currentLevel.levelNumber) + 1;
    if (nextIdx < GAME_LEVELS.length) {
      setCurrentLevel(GAME_LEVELS[nextIdx]);
    }
  };

  // Retry current level
  const handleRetryLevel = () => {
    setGameResult((prev) => ({ ...prev, isOpen: false }));
    setCurrentLevel({ ...currentLevel });
  };

  // Update player name
  const handleUpdateName = (newName: string) => {
    setProfile((prev) => ({ ...prev, name: newName }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#162e10] text-[#fef9c3]">
      {/* App Header */}
      <Header
        profile={profile}
        onOpenLevels={() => setShowLevelSelect(true)}
        onOpenMedals={() => setShowMedals(true)}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
        onOpenTutor={() => setShowTutor(true)}
      />

      {/* Main Arena */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 max-w-6xl mx-auto w-full">
        <WhackAMoleArena
          key={`mole-${currentLevel.id}-${gameResult.isOpen ? 'open' : 'closed'}`}
          level={currentLevel}
          profile={profile}
          onGameFinish={handleGameFinish}
          onOpenLevelSelect={() => setShowLevelSelect(true)}
          onOpenMedals={() => setShowMedals(true)}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onOpenTutor={() => setShowTutor(true)}
        />
      </main>

      {/* Footer Info */}
      <footer className="w-full bg-[#0e1f0a] border-t border-emerald-900/80 py-2.5 px-4 text-center text-xs text-emerald-400 font-bubble">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5">
          <span>Golpea al Topo: 10 Niveles de Binarios a Decimales</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTutor(true)}
              className="text-amber-300 hover:underline cursor-pointer font-bold"
            >
              Cómo Jugar
            </button>
            <span>·</span>
            <button
              onClick={() => setShowMedals(true)}
              className="text-amber-300 hover:underline cursor-pointer font-bold"
            >
              10 Medallas
            </button>
            <span>·</span>
            <button
              onClick={() => setShowLeaderboard(true)}
              className="text-amber-300 hover:underline cursor-pointer font-bold"
            >
              Tabla de Clasificación
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LevelSelectModal
        isOpen={showLevelSelect}
        onClose={() => setShowLevelSelect(false)}
        profile={profile}
        onSelectLevel={(lvl) => setCurrentLevel(lvl)}
        currentLevelId={currentLevel.levelNumber}
      />

      <MedalsModal
        isOpen={showMedals}
        onClose={() => setShowMedals(false)}
        profile={profile}
      />

      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        playerName={profile.name}
        onUpdateName={handleUpdateName}
        currentScore={profile.highScore}
      />

      <BinaryTutorModal
        isOpen={showTutor}
        onClose={() => setShowTutor(false)}
      />

      <DuelResultModal
        isOpen={gameResult.isOpen}
        isVictory={gameResult.isVictory}
        level={currentLevel}
        scoreEarned={gameResult.scoreEarned}
        correctCount={gameResult.correctCount}
        totalQuestions={gameResult.totalQuestions}
        fastestShotSeconds={gameResult.fastestShotSeconds}
        onNextLevel={handleNextLevel}
        onRetryLevel={handleRetryLevel}
        onOpenTutor={() => {
          setGameResult((prev) => ({ ...prev, isOpen: false }));
          setShowTutor(true);
        }}
        hasNextLevel={currentLevel.levelNumber < 10}
      />

      {/* Offline Connectivity indicator */}
      <OfflineIndicator />
    </div>
  );
}
