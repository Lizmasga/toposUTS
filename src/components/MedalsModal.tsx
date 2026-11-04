import React from 'react';
import { X, Award, CheckCircle2, Lock, Star } from 'lucide-react';
import { GAME_MEDALS } from '../data/levels';
import { PlayerProfile } from '../types/game';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
}

export const MedalsModal: React.FC<Props> = ({ isOpen, onClose, profile }) => {
  if (!isOpen) return null;

  const getTierColor = (tier: string, isUnlocked: boolean) => {
    if (!isUnlocked) return 'border-neutral-800 bg-neutral-900/60 text-neutral-500 opacity-60';
    switch (tier) {
      case 'bronze':
        return 'border-amber-700/80 bg-gradient-to-br from-[#452210] to-[#261309] text-amber-400 shadow-amber-900/40 shadow-lg';
      case 'copper':
        return 'border-orange-600/80 bg-gradient-to-br from-[#4d2511] to-[#291308] text-orange-400 shadow-orange-900/40 shadow-lg';
      case 'iron':
        return 'border-slate-500/80 bg-gradient-to-br from-[#2a3038] to-[#14181c] text-slate-300 shadow-slate-900/40 shadow-lg';
      case 'silver':
        return 'border-zinc-300/80 bg-gradient-to-br from-[#434b54] to-[#1e2329] text-zinc-100 shadow-zinc-600/30 shadow-lg';
      case 'nickel':
        return 'border-teal-500/80 bg-gradient-to-br from-[#1b3d39] to-[#0f211f] text-teal-300 shadow-teal-900/40 shadow-lg';
      case 'emerald':
        return 'border-emerald-400/80 bg-gradient-to-br from-[#0c3822] to-[#071f13] text-emerald-300 shadow-emerald-500/30 shadow-lg';
      case 'ruby':
        return 'border-rose-500/80 bg-gradient-to-br from-[#590f1d] to-[#2e050c] text-rose-300 shadow-rose-900/50 shadow-lg';
      case 'sapphire':
        return 'border-cyan-400/80 bg-gradient-to-br from-[#0e3b52] to-[#061e2b] text-cyan-200 shadow-cyan-400/30 shadow-lg';
      case 'diamond':
        return 'border-indigo-400/90 bg-gradient-to-br from-[#271d54] to-[#120d2b] text-indigo-200 shadow-indigo-500/40 shadow-lg';
      case 'legend':
        return 'border-amber-400 bg-gradient-to-br from-[#783e02] via-[#b45309] to-[#361a02] text-amber-200 shadow-amber-400/60 shadow-xl ring-2 ring-amber-400/60';
      default:
        return 'border-amber-700 bg-amber-950 text-amber-300';
    }
  };

  const unlockedCount = profile.completedLevels.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl bg-[#1c3314] border-4 border-amber-500 shadow-2xl p-4 sm:p-6 text-amber-100 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-emerald-950/80 text-amber-400 hover:text-white hover:bg-emerald-900 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-4 border-b border-emerald-800/80 pb-3">
          <div className="w-12 h-12 rounded-2xl bg-[#523319] text-amber-400 border-2 border-amber-400 flex items-center justify-center shrink-0">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-game text-amber-300">
              COFRE DE MEDALLAS DEL CAZATOPOS
            </h2>
            <div className="flex items-center gap-2 text-xs text-emerald-300 font-bubble mt-0.5">
              <span>{unlockedCount} de 10 Medallas Desbloqueadas</span>
              <span>·</span>
              <span className="text-amber-400 font-bold">{Math.round((unlockedCount / 10) * 100)}% Completado</span>
            </div>
          </div>
        </div>

        {/* Medals Grid (10 levels) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-4">
          {GAME_MEDALS.map((medal) => {
            const isUnlocked = profile.completedLevels.includes(medal.level);
            return (
              <div
                key={medal.id}
                className={`relative flex items-center gap-3.5 p-3.5 rounded-2xl border-2 transition-all ${getTierColor(
                  medal.tier,
                  isUnlocked
                )}`}
              >
                {/* Medal Icon Badge */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                    isUnlocked
                      ? 'bg-black/30 border-white/20'
                      : 'bg-black/50 border-neutral-800'
                  }`}
                >
                  {isUnlocked ? (
                    medal.tier === 'legend' ? (
                      <span className="text-3xl animate-bounce">👑</span>
                    ) : (
                      <span className="text-2xl">🦔</span>
                    )
                  ) : (
                    <Lock className="w-5 h-5 text-neutral-600" />
                  )}
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] uppercase tracking-wider font-extrabold font-mono opacity-80 text-amber-300">
                      Nivel {medal.level}
                    </span>
                    {isUnlocked && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/50">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        DESBLOQUEADA
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-extrabold text-white truncate font-game mt-0.5">
                    {medal.title}
                  </h4>
                  <p className="text-xs text-amber-200/90 font-bubble font-medium">
                    {medal.subtitle}
                  </p>
                  <p className="text-[11px] text-emerald-200/80 mt-1 line-clamp-2 font-bubble">
                    {medal.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Special Ultimate Badge banner */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-[#2e180d] via-[#4d2813] to-[#2e180d] border-2 border-amber-400 flex items-center gap-3">
          <span className="text-3xl">👑</span>
          <p className="text-xs text-amber-200 font-bubble leading-relaxed">
            ¡Supera los 10 desafíos de madrigueras para ganar la legendaria <strong>Corona Dorada del Rey Topo</strong> y convertirte en el maestro absoluto de los binarios!
          </p>
        </div>

        {/* Close Button */}
        <div className="mt-4 pt-3 border-t border-emerald-800/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold font-game text-xs tracking-wider uppercase transition shadow cursor-pointer"
          >
            Cerrar Cofre
          </button>
        </div>
      </div>
    </div>
  );
};
