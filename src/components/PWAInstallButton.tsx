import React, { useState } from 'react';
import { Download, Share2, Check, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShareOrCopy = async () => {
    const url = window.location.href;
    const shareData = {
      title: 'Golpea al Topo Binario: ¡Whack-a-Mole!',
      text: '¡Aprende números binarios golpeando al topo correcto cuando se asoma de su madriguera! ¿Podrás ganar las 10 medallas?',
      url,
    };

    if (navigator.share && /mobile|android|iphone/i.test(navigator.userAgent)) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled or fallback to copy
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      window.prompt('Copia este enlace para jugar o compartir:', url);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Share / Copy Link button */}
      <button
        onClick={handleShareOrCopy}
        title="Compartir o Copiar Enlace"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-600 hover:border-amber-400 text-amber-200 text-xs font-bold font-tropical tracking-wide hover:bg-emerald-900 transition shadow-sm active:scale-95 cursor-pointer"
      >
        {copiedLink ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-300">¡Copiado!</span>
          </>
        ) : (
          <>
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Compartir Link</span>
          </>
        )}
      </button>

      {/* PWA Install Button */}
      {!isInstalled && isInstallable && (
        <button
          onClick={install}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-900 text-xs font-extrabold font-game shadow-md hover:shadow-amber-500/30 transition active:scale-95 border border-amber-300 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Descargar App</span>
        </button>
      )}

      {/* iOS Safari Fallback */}
      {!isInstalled && isIOS && (
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-900/60 border border-emerald-600 hover:border-amber-400 text-amber-300 text-xs font-bold font-tropical transition active:scale-95 cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Instalar en iOS</span>
        </button>
      )}

      {/* iOS Modal Instructions */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#14281d] border-4 border-amber-500 p-6 shadow-2xl text-amber-100">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 text-amber-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🥥</span>
              <h3 className="text-lg font-extrabold font-game text-amber-300">Instalar en iPhone / iPad</h3>
            </div>
            <p className="text-xs text-emerald-200/90 leading-relaxed mb-4 font-tropical">
              Puedes descargar y jugar Rompe Cocos a pantalla completa como una app nativa:
            </p>
            <ol className="text-xs space-y-2.5 text-amber-100 bg-emerald-950/70 p-3.5 rounded-2xl border border-emerald-800 list-decimal list-inside font-tropical">
              <li>Toca el botón <strong>Compartir</strong> <span className="text-cyan-400">[⎋]</span> en la barra inferior de Safari.</li>
              <li>Desplázate y pulsa <strong>Agregar a Inicio</strong> (Add to Home Screen).</li>
              <li>Toca <strong>Agregar</strong> arriba a la derecha.</li>
            </ol>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-2xl bg-amber-500 hover:bg-amber-400 py-2.5 text-xs font-black font-game text-stone-900 transition shadow"
            >
              ¡ENTENDIDO, A JUGAR!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
