import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, ArrowRight, HelpCircle } from 'lucide-react';
import { LevelConfig, Medal } from '../types/game';
import { GAME_MEDALS } from '../data/levels';
import { sound } from '../utils/audio';

interface Props {
  isOpen: boolean;
  isVictory: boolean;
  level: LevelConfig;
  scoreEarned: number;
  correctCount: number;
  totalQuestions: number;
  fastestShotSeconds: number;
  onNextLevel: () => void;
  onRetryLevel: () => void;
  onOpenTutor: () => void;
  hasNextLevel: boolean;
}

export const DuelResultModal: React.FC<Props> = ({
  isOpen,
  isVictory,
  level,
  scoreEarned,
  correctCount,
  totalQuestions,
  fastestShotSeconds,
  onNextLevel,
  onRetryLevel,
  onOpenTutor,
  hasNextLevel,
}) => {
  useEffect(() => {
    if (isOpen && isVictory) {
      sound.playVictory();
      try {
        confetti({
          particleCount: 85,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#38bdf8', '#fbbf24', '#ffffff'],
        });
      } catch (e) {
        console.error('Confetti error', e);
      }
    } else if (isOpen && !isVictory) {
      sound.playWrong();
    }
  }, [isOpen, isVictory]);

  if (!isOpen) return null;

  const currentMedal: Medal | undefined = GAME_MEDALS.find(m => m.level === level.levelNumber);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#1c3314] border-4 border-amber-500 shadow-2xl p-5 sm:p-7 text-amber-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Illustration */}
        <div className="flex flex-col items-center text-center mb-3">
          <div
            className={`w-24 h-24 rounded-3xl flex items-center justify-center border-4 shadow-xl mb-3 ${
              isVictory
                ? 'bg-[#335c24] border-amber-400 shadow-amber-500/40 animate-bounce text-4xl'
                : 'bg-rose-950/80 border-rose-600 shadow-rose-900/50 text-4xl'
            }`}
          >
            {isVictory ? '👑' : '🦔'}
          </div>

          <h2
            className={`text-2xl sm:text-3xl font-extrabold font-game tracking-wider ${
              isVictory ? 'text-amber-300 drop-shadow' : 'text-rose-400'
            }`}
          >
            {isVictory ? '¡NIVEL COMPLETADO!' : '¡SE ESCAPARON LOS TOPOS!'}
          </h2>

          <p className="text-xs sm:text-sm text-emerald-200/90 font-bubble mt-1 max-w-sm">
            {isVictory
              ? `¡Has cazado a los topos de ${level.meadowName} con gran velocidad de cálculo!`
              : `Se acabó el tiempo o te quedaste sin zanahorias de vida. ¡Vuelve a intentarlo!`}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 bg-black/50 p-3.5 rounded-2xl border-2 border-emerald-900 text-center my-3 font-mono-binary">
          <div>
            <span className="text-[10px] text-emerald-400/90 uppercase font-bubble font-bold block">Puntos</span>
            <span className="text-base sm:text-lg font-bold text-amber-300">
              +{scoreEarned.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-emerald-400/90 uppercase font-bubble font-bold block">Topos Acertados</span>
            <span className="text-base sm:text-lg font-bold text-emerald-300">
              {correctCount}/{totalQuestions}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-emerald-400/90 uppercase font-bubble font-bold block">Tiro Más Rápido</span>
            <span className="text-base sm:text-lg font-bold text-cyan-300">
              {fastestShotSeconds < 99 ? `${fastestShotSeconds.toFixed(1)}s` : '-'}
            </span>
          </div>
        </div>

        {/* Unlocked Medal Banner (On Victory) */}
        {isVictory && currentMedal && (
          <div className="my-3.5 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950 via-[#254d1d] to-emerald-950 border-2 border-amber-400/90 flex items-center gap-3.5 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-2xl shrink-0">
              🦔
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-amber-300 font-extrabold uppercase tracking-wider font-bubble block">
                ¡NUEVA MEDALLA DESBLOQUEADA!
              </span>
              <h4 className="text-sm font-extrabold text-white font-game truncate">
                {currentMedal.title}: {currentMedal.subtitle}
              </h4>
              <p className="text-[11px] text-emerald-200/80 font-bubble line-clamp-1">
                {currentMedal.description}
              </p>
            </div>
          </div>
        )}

        {/* Tip / Binary Tutor hint when lost */}
        {!isVictory && (
          <div className="my-3 p-3 rounded-2xl bg-emerald-950/70 border border-emerald-800 text-xs text-emerald-200 flex items-center justify-between font-bubble">
            <span>¿Quieres repasar cómo sumar los topos antes de volver a jugar?</span>
            <button
              onClick={onOpenTutor}
              className="ml-2 flex items-center gap-1 text-xs text-amber-300 underline font-bold shrink-0 hover:text-white cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Ver Guía
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-emerald-800/80 flex flex-col sm:flex-row items-center gap-2.5 font-game">
          <button
            onClick={onRetryLevel}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-950 hover:bg-emerald-900 border-2 border-emerald-700 text-amber-200 text-xs uppercase tracking-wider transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            {isVictory ? 'Repetir Prado' : 'Reintentar Prado'}
          </button>

          {isVictory && hasNextLevel && (
            <button
              onClick={onNextLevel}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-900 text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              <span>Siguiente Prado</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {isVictory && !hasNextLevel && (
            <div className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-stone-900 font-extrabold text-xs uppercase tracking-wider text-center shadow-lg">
              ¡Completaste los 10 Niveles! 🦔👑
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
