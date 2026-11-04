import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, Flame, Volume2, VolumeX, Eye, EyeOff, ChevronRight, Sparkles, Award } from 'lucide-react';
import { LevelConfig, Question, PlayerProfile } from '../types/game';
import { generateQuestionForLevel, formatBinaryWithSpaces } from '../utils/binary';
import { sound } from '../utils/audio';

interface Props {
  level: LevelConfig;
  profile: PlayerProfile;
  onGameFinish: (victory: boolean, stats: { scoreEarned: number; correctCount: number; fastestHitSeconds: number; totalQuestions: number }) => void;
  onOpenLevelSelect: () => void;
  onOpenMedals: () => void;
  onOpenLeaderboard: () => void;
  onOpenTutor: () => void;
}

interface MoleHoleState {
  holeIndex: number;
  isActive: boolean;
  value: number;
  isCorrect: boolean;
  status: 'rising' | 'peeking' | 'whacked' | 'wrong' | 'hiding';
  key: string;
}

interface HitEffect {
  id: number;
  holeIndex: number;
  type: 'correct' | 'wrong';
  x: number;
  y: number;
}

export const WhackAMoleArena: React.FC<Props> = ({
  level,
  profile,
  onGameFinish,
  onOpenLevelSelect,
  onOpenMedals,
  onOpenLeaderboard,
  onOpenTutor,
}) => {
  // 9 mole holes (3x3 perspective meadow layout)
  const [currentQuestion, setCurrentQuestion] = useState<Question>(() => generateQuestionForLevel(level));
  const [correctHits, setCorrectHits] = useState(0);
  const [lives, setLives] = useState(3);
  const [scoreEarned, setScoreEarned] = useState(0);
  const [fastestHit, setFastestHit] = useState(999);
  const [timeLeft, setTimeLeft] = useState(level.timePerRound);
  const [isRoundOver, setIsRoundOver] = useState(false);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [showBitHints, setShowBitHints] = useState(false);
  const [isMuted, setIsMuted] = useState(() => sound.getMuted());
  const [feedbackToast, setFeedbackToast] = useState<{ text: string; color: string } | null>(null);
  const [hitEffects, setHitEffects] = useState<HitEffect[]>([]);

  // Array of 9 holes:
  const [holes, setHoles] = useState<MoleHoleState[]>(() =>
    Array.from({ length: 9 }, (_, idx) => ({
      holeIndex: idx,
      isActive: false,
      value: 0,
      isCorrect: false,
      status: 'hiding',
      key: `hole-${idx}`,
    }))
  );

  const questionStartTimeRef = useRef<number>(Date.now());
  const spawnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const roundTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Audio toggle
  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  // Trigger game defeat
  const triggerDefeat = useCallback(() => {
    setIsRoundOver(true);
    sound.playWrong();
    setTimeout(() => {
      onGameFinish(false, {
        scoreEarned,
        correctCount: correctHits,
        fastestHitSeconds: fastestHit === 999 ? 0 : fastestHit,
        totalQuestions: level.questionsToPass,
      });
    }, 700);
  }, [scoreEarned, correctHits, fastestHit, level.questionsToPass, onGameFinish]);

  // Round Timer countdown
  useEffect(() => {
    if (isRoundOver) return;

    roundTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(roundTimerRef.current!);
          triggerDefeat();
          return 0;
        }
        if (prev <= 4) {
          sound.playTimerTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (roundTimerRef.current) clearInterval(roundTimerRef.current);
    };
  }, [isRoundOver, triggerDefeat]);

  // Mole Spawning Engine:
  // Randomly selects holes to peek moles with options, ensuring the correct answer is among them.
  const spawnMoles = useCallback(() => {
    if (isRoundOver) return;

    setHoles((prevHoles) => {
      // Find empty holes
      const availableIndices = prevHoles
        .map((h, i) => (!h.isActive ? i : -1))
        .filter((i) => i !== -1);

      if (availableIndices.length < 2) return prevHoles;

      // Pick how many moles to spawn based on level
      const countToSpawn = Math.min(
        level.simultaneousMoles,
        availableIndices.length
      );

      // Shuffle available holes
      const shuffledHoles = [...availableIndices].sort(() => Math.random() - 0.5);
      const chosenHoles = shuffledHoles.slice(0, countToSpawn);

      // We need option values for these chosen holes
      // Make sure currentQuestion.decimalAnswer is included
      const distractorOptions = currentQuestion.options.filter(
        (opt) => opt !== currentQuestion.decimalAnswer
      );
      const shuffledDistractors = [...distractorOptions].sort(() => Math.random() - 0.5);

      const assignedValues: { value: number; isCorrect: boolean }[] = [];
      // Hole 0 gets correct answer
      assignedValues.push({ value: currentQuestion.decimalAnswer, isCorrect: true });
      // Other holes get distractors
      for (let i = 1; i < countToSpawn; i++) {
        const dist = shuffledDistractors[i - 1] ?? (currentQuestion.decimalAnswer + i * 2);
        assignedValues.push({ value: dist, isCorrect: false });
      }
      // Shuffle values among chosen holes
      assignedValues.sort(() => Math.random() - 0.5);

      sound.playMolePop();

      const nextHoles = [...prevHoles];
      chosenHoles.forEach((holeIdx, i) => {
        const item = assignedValues[i];
        nextHoles[holeIdx] = {
          holeIndex: holeIdx,
          isActive: true,
          value: item.value,
          isCorrect: item.isCorrect,
          status: 'rising',
          key: `mole-${holeIdx}-${Date.now()}-${Math.random()}`,
        };
      });

      return nextHoles;
    });

    // Schedule moles to hide after stay duration
    const stayMs = level.moleStayDuration * 1000;
    setTimeout(() => {
      setHoles((prevHoles) =>
        prevHoles.map((h) => {
          if (h.isActive && h.status !== 'whacked' && h.status !== 'wrong') {
            return { ...h, status: 'hiding', isActive: false };
          }
          return h;
        })
      );
    }, stayMs);
  }, [currentQuestion, isRoundOver, level.simultaneousMoles, level.moleStayDuration]);

  // Initial and recurring spawn loop
  useEffect(() => {
    if (isRoundOver) return;

    spawnMoles();
    const intervalMs = (level.moleStayDuration + 0.6) * 1000;
    spawnTimerRef.current = setInterval(spawnMoles, intervalMs);

    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    };
  }, [spawnMoles, isRoundOver, level.moleStayDuration]);

  // When player clicks / taps a mole
  const handleHitMole = (holeIndex: number, e?: React.MouseEvent | React.TouchEvent) => {
    const mole = holes[holeIndex];
    if (!mole || !mole.isActive || mole.status === 'whacked' || mole.status === 'wrong' || isRoundOver) {
      return;
    }

    const elapsed = (Date.now() - questionStartTimeRef.current) / 1000;
    if (elapsed < fastestHit) {
      setFastestHit(elapsed);
    }

    if (mole.isCorrect) {
      // Correct mole hit! WHACK!
      sound.playWhack();

      // Calculate points & combo
      const speedBonus = elapsed < 2.0 ? 300 : elapsed < 3.5 ? 150 : 50;
      const basePoints = level.levelNumber * 100 + 150;
      const pointsWon = (basePoints + speedBonus) * comboMultiplier;

      setScoreEarned((prev) => prev + pointsWon);
      const nextCorrect = correctHits + 1;
      setCorrectHits(nextCorrect);
      setComboMultiplier((prev) => Math.min(prev + 1, 4));

      setFeedbackToast({
        text: `¡ZAS! ¡Topo Cazado! (+${pointsWon} pts)`,
        color: 'text-amber-300',
      });

      // Update mole status to whacked (shows dizzy glasses & stars)
      setHoles((prev) =>
        prev.map((h) =>
          h.holeIndex === holeIndex ? { ...h, status: 'whacked' } : h
        )
      );

      // Check if level passed
      if (nextCorrect >= level.questionsToPass) {
        setIsRoundOver(true);
        sound.playVictory();
        setTimeout(() => {
          onGameFinish(true, {
            scoreEarned: scoreEarned + pointsWon,
            correctCount: nextCorrect,
            fastestHitSeconds: Math.min(fastestHit, elapsed),
            totalQuestions: level.questionsToPass,
          });
        }, 1100);
        return;
      }

      // Generate next binary question after a moment and respawn
      setTimeout(() => {
        setFeedbackToast(null);
        const nextQ = generateQuestionForLevel(level, [currentQuestion.decimalAnswer]);
        setCurrentQuestion(nextQ);
        questionStartTimeRef.current = Date.now();
        // Hide all moles
        setHoles((prev) =>
          prev.map((h) => ({ ...h, isActive: false, status: 'hiding' }))
        );
        // Spawn fresh moles immediately for next question
        setTimeout(spawnMoles, 300);
      }, 700);
    } else {
      // Hit WRONG mole!
      sound.playWrong();
      setComboMultiplier(1);
      const newLives = lives - 1;
      setLives(newLives);

      setFeedbackToast({
        text: `¡Ese no era! Era ${currentQuestion.decimalAnswer}`,
        color: 'text-rose-400',
      });

      setHoles((prev) =>
        prev.map((h) =>
          h.holeIndex === holeIndex ? { ...h, status: 'wrong' } : h
        )
      );

      if (newLives <= 0) {
        triggerDefeat();
      } else {
        setTimeout(() => {
          setFeedbackToast(null);
          setHoles((prev) =>
            prev.map((h) =>
              h.holeIndex === holeIndex ? { ...h, isActive: false, status: 'hiding' } : h
            )
          );
        }, 600);
      }
    }
  };

  // Keyboard accessibility (numpad / 1-9)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyNum = parseInt(e.key, 10);
      if (keyNum >= 1 && keyNum <= 9) {
        // Map 1-9 to 0-8 holeIndex
        handleHitMole(keyNum - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [holes, isRoundOver]);

  const timePercent = Math.max(0, (timeLeft / level.timePerRound) * 100);

  return (
    <div
      className="relative w-full min-h-[88vh] flex flex-col justify-between overflow-hidden rounded-3xl border-4 border-amber-800/80 select-none shadow-2xl mole-field-bg whack-cursor"
    >
      {/* TOP HEADER / HUD BAR */}
      <div className="relative z-30 w-full bg-gradient-to-b from-[#1c3314]/95 via-[#1c3314]/80 to-transparent p-2.5 sm:p-4 text-amber-100">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Level / Meadow Name */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenLevelSelect}
              className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#2e5222] border-2 border-emerald-400/50 hover:border-amber-300 transition shadow cursor-pointer"
            >
              <span className="text-xl">🦔</span>
              <div className="text-left">
                <span className="text-[10px] uppercase font-mono text-emerald-200 font-bold block leading-tight">
                  NIVEL {level.levelNumber} DE 10
                </span>
                <span className="text-xs sm:text-sm font-extrabold font-game text-amber-200 flex items-center gap-1">
                  {level.meadowName}
                  <ChevronRight className="w-3.5 h-3.5 text-amber-300 opacity-70" />
                </span>
              </div>
            </button>

            {/* Score Bounty */}
            <div className="hidden sm:flex flex-col text-left px-2 border-l border-emerald-700">
              <span className="text-[9px] uppercase tracking-wider text-emerald-300 font-bubble">Puntos</span>
              <span className="text-xs font-mono font-bold text-amber-300">
                +{level.rewardScore.toLocaleString()} pts
              </span>
            </div>
          </div>

          {/* Center: Lives (Carrots / Moles) & Combo */}
          <div className="flex items-center gap-2 sm:gap-3 bg-black/45 px-3.5 py-1.5 rounded-2xl border-2 border-emerald-700">
            <span className="text-[10px] uppercase font-extrabold font-bubble text-amber-300 hidden xs:inline">
              Vidas:
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((lifeIdx) => (
                <span
                  key={lifeIdx}
                  className={`text-xl transition-all duration-300 ${
                    lifeIdx <= lives
                      ? 'scale-100 filter drop-shadow'
                      : 'scale-75 opacity-25 grayscale'
                  }`}
                  title={lifeIdx <= lives ? 'Vida activa' : 'Vida perdida'}
                >
                  🥕
                </span>
              ))}
            </div>

            {comboMultiplier > 1 && (
              <div className="flex items-center gap-1 text-amber-300 text-xs font-black font-game pl-2 border-l border-emerald-600">
                <Flame className="w-4 h-4 text-orange-400 fill-orange-400 animate-pulse" />
                <span>x{comboMultiplier}</span>
              </div>
            )}
          </div>

          {/* Right: Score, Sound & Tutor Shortcuts */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Score */}
            <div className="bg-[#1f3a17] px-3 py-1 rounded-xl border border-emerald-600/70 text-right">
              <span className="text-[9px] uppercase text-emerald-300 font-bubble block leading-tight font-bold">Total</span>
              <span className="text-xs sm:text-sm font-mono-binary font-extrabold text-amber-300">
                {scoreEarned.toLocaleString()}
              </span>
            </div>

            {/* Hint Toggler */}
            <button
              onClick={() => setShowBitHints(!showBitHints)}
              className={`p-2 rounded-xl border-2 transition cursor-pointer ${
                showBitHints
                  ? 'bg-amber-400 text-stone-900 border-amber-300 font-bold'
                  : 'bg-[#27481d] text-amber-200 border-emerald-600 hover:text-white'
              }`}
              title={showBitHints ? 'Ocultar Guía de Bits' : 'Mostrar Guía de Bits'}
            >
              {showBitHints ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="p-2 rounded-xl bg-[#27481d] border-2 border-emerald-600 text-amber-300 hover:text-white transition cursor-pointer"
              title={isMuted ? 'Activar Sonido' : 'Silenciar'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* TIME BAR (Just like Wordwall top bar!) */}
        <div className="max-w-xl mx-auto mt-2">
          <div className="flex items-center justify-between text-[11px] font-bubble font-bold mb-1 px-1">
            <span className="flex items-center gap-1 text-amber-200">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Tiempo: <span className={timeLeft <= 4 ? 'text-rose-400 font-black animate-pulse font-mono' : 'text-amber-300 font-mono'}>{timeLeft}s</span>
            </span>
            <span className="text-emerald-300">
              Topos Acertados: <strong className="text-amber-300 font-mono text-sm">{correctHits}</strong> / {level.questionsToPass}
            </span>
          </div>
          <div className="relative w-full h-3 rounded-full bg-black/50 border-2 border-emerald-900 overflow-hidden shadow-inner">
            <div
              className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                timeLeft <= 4
                  ? 'bg-gradient-to-r from-rose-500 to-red-600 animate-pulse'
                  : timeLeft <= 7
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                  : 'bg-white'
              }`}
              style={{ width: `${timePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* CENTER: WORDWALL WOODEN POST SIGNBOARD */}
      <div className="relative z-20 flex flex-col items-center justify-center px-4 pt-2">
        {/* Feedback Toast */}
        {feedbackToast && (
          <div
            className={`absolute -top-3 z-40 py-1.5 px-4 rounded-full bg-black/90 border-2 border-amber-400 font-game text-xs sm:text-sm font-bold shadow-2xl animate-bounce ${feedbackToast.color}`}
          >
            {feedbackToast.text}
          </div>
        )}

        {/* Post Pole */}
        <div className="w-4 h-6 bg-[#634327] border-x border-[#3b2715] shadow-sm -mb-1" />

        {/* Wooden Signboard (Wordwall style) */}
        <div className="relative wood-sign rounded-2xl px-5 sm:px-8 py-3.5 border-4 border-[#523319] max-w-lg w-full text-center shadow-xl">
          {/* Sign bolts */}
          <div className="absolute top-2 left-2.5 w-2.5 h-2.5 rounded-full bg-[#3d2410] border border-[#7a4e28]" />
          <div className="absolute top-2 right-2.5 w-2.5 h-2.5 rounded-full bg-[#3d2410] border border-[#7a4e28]" />
          <div className="absolute bottom-2 left-2.5 w-2.5 h-2.5 rounded-full bg-[#3d2410] border border-[#7a4e28]" />
          <div className="absolute bottom-2 right-2.5 w-2.5 h-2.5 rounded-full bg-[#3d2410] border border-[#7a4e28]" />

          <h3 className="text-xs sm:text-sm font-extrabold font-bubble text-[#fef9c3] tracking-wide drop-shadow-sm mb-1 uppercase">
            Golpea al topo que tenga el resultado de:
          </h3>

          {/* Big Binary Code */}
          <div className="inline-flex items-center justify-center px-4 py-1.5 bg-[#2b180d]/80 rounded-xl border-2 border-[#7a4b27] shadow-inner my-1">
            <span className="text-3xl sm:text-4xl font-mono-binary font-black text-amber-300 tracking-widest drop-shadow">
              {formatBinaryWithSpaces(currentQuestion.binary)}
            </span>
          </div>

          {/* Optional Bit Place-Value Helper */}
          {showBitHints && (
            <div className="mt-2 pt-1.5 border-t border-[#6e4320] flex items-center justify-center gap-1.5 overflow-x-auto">
              {currentQuestion.bits.map((bit, i) => (
                <div
                  key={i}
                  className={`flex flex-col items-center px-2 py-0.5 rounded-lg border ${
                    bit === 1
                      ? 'bg-amber-400/30 border-amber-300 text-amber-200 font-bold scale-105'
                      : 'opacity-30 border-stone-800 text-stone-400'
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold text-amber-300">{currentQuestion.placeValues[i]}</span>
                  <span className="text-xs font-mono font-black">{bit}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM / MAIN: 9 MOLE HOLES MEADOW (Wordwall perspective layout) */}
      <div className="relative z-10 flex-1 max-w-4xl mx-auto w-full px-3 py-4 sm:py-6 flex flex-col justify-end">
        {/* 3 Rows of Holes:
            Row 1: holes 0, 1, 2
            Row 2: holes 3, 4, 5
            Row 3: holes 6, 7, 8
        */}
        <div className="grid grid-cols-3 gap-x-2 sm:gap-x-8 gap-y-4 sm:gap-y-8 items-end justify-items-center w-full">
          {holes.map((mole, idx) => {
            const isWhacked = mole.status === 'whacked';
            const isWrong = mole.status === 'wrong';
            const isPeeking = mole.isActive && mole.status !== 'hiding';

            return (
              <div
                key={idx}
                className="relative flex flex-col items-center justify-end w-full max-w-[170px] h-[130px] sm:h-[160px]"
              >
                {/* MOLE CHARACTER (When active) */}
                {isPeeking && (
                  <div
                    onClick={(e) => handleHitMole(idx, e)}
                    className={`absolute bottom-6 sm:bottom-8 z-20 flex flex-col items-center cursor-pointer select-none transition-transform active:scale-90 ${
                      isWhacked ? 'animate-mole-dizzy' : 'animate-mole-rise'
                    }`}
                  >
                    {/* SPEECH BUBBLE (Wordwall style) with cream backdrop and bold text */}
                    <div
                      className={`speech-bubble px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl mb-2 text-center min-w-[70px] sm:min-w-[85px] transition-transform ${
                        isWhacked
                          ? 'bg-emerald-100 border-emerald-600 scale-105'
                          : isWrong
                          ? 'bg-rose-100 border-rose-600 line-through'
                          : 'hover:scale-105'
                      }`}
                    >
                      <span className="text-xl sm:text-2xl font-bold font-bubble text-[#1a1a1a] block leading-none">
                        {mole.value}
                      </span>
                    </div>

                    {/* MOLE HEAD & BODY */}
                    <div className="relative w-16 sm:w-20 h-16 sm:h-20 rounded-t-full bg-[#6d4c3d] border-2 border-[#3d271d] shadow-lg flex flex-col items-center justify-start pt-2">
                      {/* Whacked Star Effect */}
                      {isWhacked && (
                        <div className="absolute -top-4 -right-2 text-2xl animate-star-burst">
                          ⭐
                        </div>
                      )}

                      {/* Dizzy Swirl Glasses (like the bottom mole in the user's screenshot!) */}
                      {isWhacked ? (
                        <div className="flex items-center gap-1 my-1">
                          <span className="text-sm font-bold text-cyan-300 animate-spin">🌀</span>
                          <span className="text-sm font-bold text-cyan-300 animate-spin">🌀</span>
                        </div>
                      ) : (
                        /* Mole Eyes */
                        <div className="flex items-center gap-3 my-1">
                          <div className="w-2.5 h-2.5 rounded-full bg-black border border-white/60" />
                          <div className="w-2.5 h-2.5 rounded-full bg-black border border-white/60" />
                        </div>
                      )}

                      {/* Cute Mole Pink Snout */}
                      <div className="w-6 h-4 rounded-full bg-[#f4a582] border border-[#a65636] flex items-center justify-center shadow-inner mt-0.5">
                        <div className="w-1.5 h-1 rounded-full bg-[#3d271d]" />
                      </div>

                      {/* Mole Whiskers */}
                      <div className="w-10 h-0.5 bg-[#3d271d]/40 rounded my-0.5" />

                      {/* Mole Paws holding the dirt */}
                      <div className="absolute -bottom-1 w-full flex justify-between px-1.5">
                        <div className="w-4 h-3.5 rounded-t-md bg-[#e59877] border border-[#7a4026]" />
                        <div className="w-4 h-3.5 rounded-t-md bg-[#e59877] border border-[#7a4026]" />
                      </div>
                    </div>
                  </div>
                )}

                {/* DIRT MOUND / HOLE (Madriguera 3D) */}
                <div
                  onClick={() => handleHitMole(idx)}
                  className="relative z-10 w-full max-w-[140px] sm:max-w-[170px] h-10 sm:h-12 flex flex-col items-center justify-center cursor-pointer"
                >
                  {/* Dark Hole Cave Opening */}
                  <div className="w-[85%] h-7 sm:h-8 rounded-full bg-[#24170e] border-2 border-[#160d07] shadow-inner" />

                  {/* Dirt Mound Bumps in front (covering mole base) */}
                  <div className="absolute -bottom-1 w-full flex items-center justify-center gap-0.5 pointer-events-none">
                    <div className="w-9 h-5 rounded-full bg-[#8c6b4f] border border-[#543b27] shadow" />
                    <div className="w-12 h-6 rounded-full bg-[#9c795b] border border-[#543b27] shadow -mx-2 z-10" />
                    <div className="w-9 h-5 rounded-full bg-[#8c6b4f] border border-[#543b27] shadow" />
                  </div>

                  {/* Hole Number marker [1..9] for keyboard play */}
                  <span className="absolute -bottom-3 text-[10px] font-mono text-[#4a3424]/60 font-bold">
                    [{idx + 1}]
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
