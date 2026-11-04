import React from 'react';
import { X, Compass, Lock, CheckCircle2, Clock } from 'lucide-react';
import { GAME_LEVELS } from '../data/levels';
import { LevelConfig, PlayerProfile } from '../types/game';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  onSelectLevel: (level: LevelConfig) => void;
  currentLevelId: number;
}

export const LevelSelectModal: React.FC<Props> = ({
  isOpen,
  onClose,
  profile,
  onSelectLevel,
  currentLevelId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl bg-[#1c3314] border-4 border-amber-500 shadow-2xl p-4 sm:p-6 text-amber-100 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-emerald-950/80 text-amber-400 hover:text-white hover:bg-emerald-900 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 border-b border-emerald-800/80 pb-3">
          <div className="w-12 h-12 rounded-2xl bg-[#523319] text-amber-400 border-2 border-amber-400 flex items-center justify-center shrink-0">
            <Compass className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-game text-amber-300">
              MAPA DE MADRIGUERAS: 10 NIVELES
            </h2>
            <p className="text-xs text-emerald-300 font-bubble">
              Elige cualquier prado desbloqueado en tu camino hacia el Rey Topo
            </p>
          </div>
        </div>

        {/* Levels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-3">
          {GAME_LEVELS.map((level) => {
            const isUnlocked = level.levelNumber <= profile.highestLevelUnlocked;
            const isCompleted = profile.completedLevels.includes(level.levelNumber);
            const isCurrent = level.levelNumber === currentLevelId;

            return (
              <div
                key={level.id}
                onClick={() => {
                  if (isUnlocked) {
                    onSelectLevel(level);
                    onClose();
                  }
                }}
                className={`relative rounded-2xl border-2 p-3.5 transition-all flex flex-col justify-between ${
                  !isUnlocked
                    ? 'border-neutral-800 bg-neutral-900/60 opacity-50 cursor-not-allowed'
                    : isCurrent
                    ? 'border-amber-400 bg-[#345c25] ring-2 ring-amber-400/50 shadow-xl cursor-pointer hover:border-amber-300'
                    : 'border-emerald-700 bg-[#24451a] hover:border-amber-400 cursor-pointer hover:bg-[#2c5420] shadow-md'
                }`}
              >
                {/* Top strip */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-xs font-black font-mono text-amber-300">
                      #{level.levelNumber}
                    </span>
                    <div>
                      <h4 className="text-sm font-extrabold text-amber-200 font-game leading-tight">
                        {level.meadowName}
                      </h4>
                      <span className="text-[11px] text-emerald-300 font-bubble font-medium">
                        {level.title.split(':')[1] || level.title}
                      </span>
                    </div>
                  </div>

                  {/* Status badge */}
                  {isCompleted ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500/50 font-bubble">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Superado
                    </span>
                  ) : isUnlocked ? (
                    <span className="text-[11px] font-bold text-amber-300 bg-amber-950/90 px-2 py-0.5 rounded-full border border-amber-500/50 font-bubble">
                      ¡Disponible!
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] text-neutral-500 bg-black/40 px-2 py-0.5 rounded-full border border-neutral-800 font-bubble">
                      <Lock className="w-3 h-3" />
                      Bloqueado
                    </span>
                  )}
                </div>

                {/* Mole info */}
                <div className="bg-black/40 rounded-xl p-2.5 my-1.5 border border-emerald-900 flex items-center justify-between font-bubble">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🦔</span>
                    <div>
                      <p className="text-xs font-bold text-amber-300 leading-tight">
                        {level.moleKingName}
                      </p>
                      <p className="text-[10px] text-emerald-300/80">
                        {level.moleAlias}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-400/80 uppercase block">Recompensa</span>
                    <span className="text-xs font-mono font-bold text-amber-300">
                      +{level.rewardScore.toLocaleString()} pts
                    </span>
                  </div>
                </div>

                {/* Level parameters */}
                <div className="flex items-center justify-between text-[11px] text-emerald-200/90 pt-2 border-t border-emerald-900 font-mono">
                  <span className="flex items-center gap-1">
                    <strong>{level.bitsCount} BITS</strong> (hasta {level.maxDecimal})
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Asoma: {level.moleStayDuration}s
                  </span>
                  <span className="text-amber-400 font-bold font-bubble">
                    {level.difficultyLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-emerald-800/80 flex items-center justify-between font-bubble">
          <p className="text-xs text-emerald-300/80">
            * Cada nivel superado desbloquea el siguiente prado y una medalla en tu vitrina.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold font-game text-xs uppercase tracking-wider transition cursor-pointer"
          >
            Cerrar Mapa
          </button>
        </div>
      </div>
    </div>
  );
};
