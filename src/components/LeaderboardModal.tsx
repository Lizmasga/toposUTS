import React, { useState } from 'react';
import { X, Trophy, UserCheck, Edit2, Check } from 'lucide-react';
import { LeaderboardEntry } from '../types/game';
import { getGlobalLeaderboard } from '../utils/storage';
import { sound } from '../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  onUpdateName: (newName: string) => void;
  currentScore: number;
}

export const LeaderboardModal: React.FC<Props> = ({
  isOpen,
  onClose,
  playerName,
  onUpdateName,
  currentScore,
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(() => getGlobalLeaderboard());
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(playerName);
  const [filter, setFilter] = useState<'all' | 'top5'>('all');

  if (!isOpen) return null;

  const handleSaveName = () => {
    if (!nameInput.trim()) return;
    onUpdateName(nameInput.trim());
    setIsEditingName(false);
    sound.playBitPop();
  };

  const displayedEntries = filter === 'top5' ? entries.slice(0, 5) : entries;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#14281d] border-4 border-amber-500 shadow-2xl p-4 sm:p-6 text-amber-100 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-emerald-950/80 text-amber-400 hover:text-white hover:bg-emerald-900 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 border-b border-emerald-800/80 pb-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border-2 border-amber-400 flex items-center justify-center shrink-0">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-game text-amber-300">
              SALÓN DE ROMPECOCOS GLOBAL
            </h2>
            <p className="text-xs text-emerald-300 font-tropical">
              Los mejores lanzadores de cocos binarios de todo el archipiélago
            </p>
          </div>
        </div>

        {/* Player Name Strip */}
        <div className="mb-4 p-3 rounded-2xl bg-emerald-950/80 border-2 border-emerald-700/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs text-emerald-300 font-tropical font-bold">Tu Nombre de Isleño:</span>
            {isEditingName ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  maxLength={24}
                  className="bg-black/60 border border-amber-400 rounded-lg px-2.5 py-1 text-xs text-amber-200 focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="p-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <strong className="text-sm font-bold text-amber-300 font-tropical">{playerName}</strong>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-amber-400/80 hover:text-amber-300 p-0.5"
                  title="Cambiar Nombre"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
          <div className="text-xs text-emerald-200 font-mono-binary">
            Tu Récord: <span className="text-amber-300 font-bold text-sm">{currentScore.toLocaleString()} pts</span>
          </div>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-emerald-900 text-xs font-tropical">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                filter === 'all' ? 'bg-amber-500 text-stone-900 shadow' : 'text-emerald-300/80 hover:text-amber-200'
              }`}
            >
              Todos los Isleños
            </button>
            <button
              onClick={() => setFilter('top5')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                filter === 'top5' ? 'bg-amber-500 text-stone-900 shadow' : 'text-emerald-300/80 hover:text-amber-200'
              }`}
            >
              Top 5 Leyendas
            </button>
          </div>
          <span className="text-[11px] text-emerald-400 font-mono">
            {displayedEntries.length} jugadores
          </span>
        </div>

        {/* Leaderboard Table */}
        <div className="rounded-2xl border-2 border-emerald-900 bg-black/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-emerald-950/90 border-b border-emerald-800 text-amber-300 font-game uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Lanzador</th>
                  <th className="py-2.5 px-3 text-center">Nivel</th>
                  <th className="py-2.5 px-3 text-center">Precisión</th>
                  <th className="py-2.5 px-3 text-right">Puntuación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950 text-amber-100 font-tropical">
                {displayedEntries.map((entry, idx) => {
                  const rank = idx + 1;
                  return (
                    <tr
                      key={entry.id}
                      className={`transition hover:bg-emerald-900/30 ${
                        entry.isPlayer
                          ? 'bg-amber-500/20 font-bold border-l-4 border-amber-400'
                          : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {rank === 1 ? (
                          <span className="flex items-center gap-1 text-amber-300 font-bold">
                            🥇 <span className="font-mono text-xs">1</span>
                          </span>
                        ) : rank === 2 ? (
                          <span className="flex items-center gap-1 text-slate-300 font-bold">
                            🥈 <span className="font-mono text-xs">2</span>
                          </span>
                        ) : rank === 3 ? (
                          <span className="flex items-center gap-1 text-amber-500 font-bold">
                            🥉 <span className="font-mono text-xs">3</span>
                          </span>
                        ) : (
                          <span className="text-emerald-400/80 font-mono">{rank}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex flex-col">
                          <span className="text-white font-bold flex items-center gap-1.5">
                            {entry.name}
                            {entry.isPlayer && (
                              <span className="text-[10px] bg-amber-400/30 text-amber-300 px-1.5 py-0.2 rounded-md border border-amber-400/50">
                                TÚ
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] text-emerald-400/80">{entry.title}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap font-mono">
                        <span className="text-amber-200">Isla {entry.levelReached}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap font-mono font-bold text-emerald-300">
                        {entry.accuracy}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono-binary font-bold text-amber-300 whitespace-nowrap">
                        {entry.score.toLocaleString()} pts
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-emerald-800/80 flex items-center justify-between font-tropical">
          <p className="text-[11px] text-emerald-300/80 italic">
            * Romper cocos rápidamente otorga bonificación de Coco Veloz.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-900 font-extrabold font-game text-xs uppercase tracking-wider transition"
          >
            Volver a Jugar
          </button>
        </div>
      </div>
    </div>
  );
};
