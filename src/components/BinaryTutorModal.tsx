import React, { useState } from 'react';
import { X, Lightbulb, CheckCircle2 } from 'lucide-react';
import { sound } from '../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const BinaryTutorModal: React.FC<Props> = ({ isOpen, onClose }) => {
  // 8 bits topos state
  const [bits, setBits] = useState<number[]>([0, 0, 1, 0, 1, 0, 1, 1]); // e.g. 43
  const powers = [128, 64, 32, 16, 8, 4, 2, 1];

  if (!isOpen) return null;

  const toggleMoleBit = (index: number) => {
    sound.playBitPop();
    setBits(prev => {
      const copy = [...prev];
      copy[index] = copy[index] === 1 ? 0 : 1;
      return copy;
    });
  };

  const currentTotal = bits.reduce((acc, bit, idx) => acc + bit * powers[idx], 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#1c3314] border-4 border-amber-500 shadow-2xl p-4 sm:p-6 text-amber-100 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-emerald-950/80 text-amber-400 hover:text-white hover:bg-emerald-900 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 border-b border-emerald-800/80 pb-3">
          <div className="w-12 h-12 rounded-2xl bg-[#523319] text-amber-400 border-2 border-amber-400 flex items-center justify-center text-2xl shrink-0">
            🦔
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-game text-amber-300">
              GUÍA DEL CAZATOPOS BINARIO
            </h2>
            <p className="text-xs text-emerald-300 font-bubble">
              Aprende a calcular el valor del topo antes de que se esconda en su madriguera
            </p>
          </div>
        </div>

        {/* Interactive Simulator with Moles */}
        <div className="mb-5 bg-gradient-to-b from-[#24451a] to-[#14280f] p-4 rounded-2xl border-2 border-emerald-600 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-amber-300 flex items-center gap-1.5 font-bubble">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              Simulador de 8 Madrigueras (Toca un topo para subirlo o bajarlo)
            </span>
            <span className="text-xs text-emerald-200 font-bubble">
              Suma Decimal: <strong className="text-xl text-amber-300 font-mono-binary ml-1">{currentTotal}</strong>
            </span>
          </div>

          {/* Interactive Moles Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 my-3">
            {bits.map((bit, idx) => (
              <button
                key={idx}
                onClick={() => toggleMoleBit(idx)}
                className={`flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all cursor-pointer select-none ${
                  bit === 1
                    ? 'bg-amber-500/25 border-amber-400 shadow-lg shadow-amber-500/30 scale-105'
                    : 'bg-black/40 border-emerald-900 opacity-60 hover:opacity-100'
                }`}
              >
                {/* Mole Visual Icon */}
                <span className="text-2xl mb-0.5 filter drop-shadow">
                  {bit === 1 ? '🦔' : '🕳️'}
                </span>
                {/* Power of 2 value */}
                <span className="text-xs font-mono font-bold text-amber-300">
                  {powers[idx]}
                </span>
                {/* 1 or 0 State */}
                <span className={`text-sm font-black font-mono-binary ${bit === 1 ? 'text-emerald-300' : 'text-neutral-500'}`}>
                  {bit === 1 ? '1 (Arriba)' : '0 (Oculto)'}
                </span>
              </button>
            ))}
          </div>

          {/* Real-time Math Addition */}
          <div className="text-xs text-amber-100 bg-black/60 p-2.5 rounded-xl border border-emerald-900 font-mono-binary overflow-x-auto text-center">
            {bits.some(b => b === 1) ? (
              <span>
                {bits
                  .map((b, i) => (b === 1 ? powers[i] : null))
                  .filter(Boolean)
                  .join(' + ')}{' '}
                = <strong className="text-amber-300 text-sm font-bold">{currentTotal}</strong>
              </span>
            ) : (
              <span className="text-neutral-400 font-bubble">Todos los topos están bajo tierra (Valor: 0)</span>
            )}
          </div>
        </div>

        {/* 3 Golden Whack-a-Mole Tricks */}
        <h3 className="text-sm font-extrabold text-amber-300 uppercase tracking-wider mb-2 font-game">
          🔨 3 Secretos del Martillo Veloz:
        </h3>
        <div className="space-y-2.5 text-xs text-emerald-100 font-bubble">
          <div className="flex items-start gap-2.5 bg-[#12230e]/80 p-3 rounded-2xl border border-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 font-bold">1. La Pista Par / Impar:</strong> Fíjate en el último bit de la derecha (posición 1). Si es <code className="text-amber-300 font-mono font-bold">1</code>, el número es IMPAR. Si es <code className="text-amber-300 font-mono font-bold">0</code>, es PAR. ¡Descarta inmediatamente los topos pares o impares!
            </div>
          </div>

          <div className="flex items-start gap-2.5 bg-[#12230e]/80 p-3 rounded-2xl border border-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 font-bold">2. Doblar Siempre:</strong> Cada paso a la izquierda vale el doble: <code className="text-amber-300 font-mono font-bold">1 → 2 → 4 → 8 → 16 → 32 → 64 → 128 → 256</code>. Solo suma los topos que tengan un 1.
            </div>
          </div>

          <div className="flex items-start gap-2.5 bg-[#12230e]/80 p-3 rounded-2xl border border-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 font-bold">3. El Atajo del "Uno Menos":</strong> Cuando una fila de unos está encendida, vale la siguiente potencia menos 1. Ejemplo: <code className="text-amber-300 font-mono">1111</code> (4 unos) = 16 - 1 = <strong className="text-amber-300 font-bold">15</strong>, y <code className="text-amber-300 font-mono">11111111</code> = 256 - 1 = <strong className="text-amber-300 font-bold">255</strong>.
            </div>
          </div>
        </div>

        {/* Footer button */}
        <div className="mt-5 pt-3 border-t border-emerald-800/80 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-900 font-black font-game text-sm tracking-wider shadow-lg transition cursor-pointer"
          >
            ¡LISTO PARA GOLPEAR AL TOPO!
          </button>
        </div>
      </div>
    </div>
  );
};
