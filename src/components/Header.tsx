import React, { useState } from 'react';
import { Award, Compass, Trophy, HelpCircle, Menu, X } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { PlayerProfile } from '../types/game';

interface Props {
  profile: PlayerProfile;
  onOpenLevels: () => void;
  onOpenMedals: () => void;
  onOpenLeaderboard: () => void;
  onOpenTutor: () => void;
}

export const Header: React.FC<Props> = ({
  profile,
  onOpenLevels,
  onOpenMedals,
  onOpenLeaderboard,
  onOpenTutor,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const unlockedMedalsCount = profile.completedLevels.length;

  return (
    <header className="w-full bg-[#183110]/95 border-b-2 border-emerald-700/80 sticky top-0 z-40 backdrop-blur-md shadow-md">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#523319] border-2 border-amber-400 flex items-center justify-center text-2xl shadow-md transform hover:rotate-6 transition">
            🦔
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg sm:text-xl font-extrabold font-game text-amber-300 tracking-wider leading-none drop-shadow">
                GOLPEA AL TOPO
              </h1>
              <span className="hidden sm:inline-block px-1.5 py-0.2 bg-emerald-800 text-[10px] text-emerald-200 font-bold rounded-md uppercase tracking-wider border border-emerald-500/50">
                Binarios
              </span>
            </div>
            <span className="text-[11px] text-emerald-300/90 font-bubble font-medium block">
              ¡Dale al topo correcto cuando se asome!
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2 text-xs font-bold text-amber-100 font-bubble">
          <button
            onClick={onOpenLevels}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/70 transition cursor-pointer text-amber-200 hover:text-white"
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>10 Niveles</span>
          </button>

          <button
            onClick={onOpenMedals}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/70 transition cursor-pointer text-amber-200 hover:text-white"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Cofre de Medallas</span>
            <span className="text-[10px] font-mono bg-amber-500/30 text-amber-300 px-1.5 py-0.2 rounded-full border border-amber-400/40 font-bold">
              {unlockedMedalsCount}/10
            </span>
          </button>

          <button
            onClick={onOpenLeaderboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/70 transition cursor-pointer text-amber-200 hover:text-white"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Marcadores</span>
          </button>

          <button
            onClick={onOpenTutor}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-400/70 transition cursor-pointer text-amber-300 hover:text-white"
          >
            <HelpCircle className="w-4 h-4 text-amber-300" />
            <span>¿Cómo Golpear al Topo?</span>
          </button>
        </nav>

        {/* Action Buttons: PWA Install & Share */}
        <div className="flex items-center gap-2">
          <PWAInstallButton />

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-emerald-950 border border-emerald-700 text-amber-300 hover:text-white"
            aria-label="Abrir Menú"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-emerald-800 bg-[#162d10] px-4 py-3 space-y-2 text-sm text-amber-100 font-bubble animate-in slide-in-from-top-2">
          <button
            onClick={() => {
              onOpenLevels();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/90 border border-emerald-700"
          >
            <span className="flex items-center gap-2 font-bold">
              <Compass className="w-4 h-4 text-amber-400" />
              10 Niveles de Madrigueras
            </span>
            <span className="text-xs text-amber-300 font-mono">Nivel {profile.highestLevelUnlocked}/10</span>
          </button>

          <button
            onClick={() => {
              onOpenMedals();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/90 border border-emerald-700"
          >
            <span className="flex items-center gap-2 font-bold">
              <Award className="w-4 h-4 text-amber-400" />
              Medallas de Topos
            </span>
            <span className="text-xs font-mono font-bold text-amber-400">
              {unlockedMedalsCount}/10
            </span>
          </button>

          <button
            onClick={() => {
              onOpenLeaderboard();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/90 border border-emerald-700"
          >
            <span className="flex items-center gap-2 font-bold">
              <Trophy className="w-4 h-4 text-amber-400" />
              Salón Global de Cazatopos
            </span>
            <span className="text-xs font-mono text-emerald-300">Récords</span>
          </button>

          <button
            onClick={() => {
              onOpenTutor();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-950/80 border border-amber-600/70 text-amber-200"
          >
            <span className="flex items-center gap-2 font-bold">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              Guía de Binarios con Topos
            </span>
            <span className="text-xs text-amber-300">Aprender</span>
          </button>
        </div>
      )}
    </header>
  );
};
