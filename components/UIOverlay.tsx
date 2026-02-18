
import React from 'react';
import { PlayerStats, GameState } from '../types';

interface UIOverlayProps {
  stats: PlayerStats;
  gameState: GameState;
  onReset: () => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ stats, gameState, onReset }) => {
  const isCrashed = gameState === GameState.CRASHED;
  const speedDisplay = Math.round(stats.speed * 600); // Scaled for intensity

  return (
    <div className="absolute inset-0 pointer-events-none z-40 p-10 font-mono">
      {/* Speedometer */}
      <div className="absolute bottom-10 left-10">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-cyan-400 text-xs font-bold tracking-widest uppercase">Velocity Engine</span>
            {stats.speed > 1.2 && <span className="text-[10px] bg-red-600 px-1 text-white animate-pulse">BOOSTING</span>}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-8xl font-black text-white italic drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{speedDisplay}</span>
            <span className="text-xl text-cyan-700">KM/H</span>
          </div>
          <div className="w-72 h-3 bg-gray-950 mt-2 rounded-sm overflow-hidden border border-white/10 p-[2px]">
            <div 
              className={`h-full transition-all duration-100 ${stats.speed > 1.2 ? 'bg-white shadow-[0_0_15px_#fff]' : 'bg-gradient-to-r from-cyan-600 to-cyan-400'}`} 
              style={{ width: `${Math.min((stats.speed / 1.8) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Progress & Record */}
      <div className="absolute top-10 left-10 flex flex-col gap-4">
        <div className="bg-black/60 backdrop-blur-xl p-6 rounded-sm border-l-4 border-fuchsia-500 shadow-2xl">
          <span className="text-fuchsia-500 text-[10px] font-bold uppercase tracking-[0.3em]">Grid Distance</span>
          <p className="text-4xl font-black text-white tracking-tighter">{Math.round(stats.distance).toLocaleString()}<span className="text-sm ml-1 text-gray-500 font-normal uppercase">Units</span></p>
        </div>
        <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest px-1">
          Sector High: {Math.round(stats.highScore).toLocaleString()}
        </div>
      </div>

      {/* Neural Feed (Commentary) */}
      <div className="absolute top-10 right-10 max-w-sm text-right">
        <div className="bg-gradient-to-l from-purple-900/60 to-transparent p-5 border-r-4 border-purple-500 backdrop-blur-sm">
           <div className="flex items-center justify-end gap-2 mb-2">
             <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
             <p className="text-purple-400 text-[10px] font-bold uppercase tracking-[0.4em]">Neural Uplink</p>
           </div>
           <p className="text-xl text-white italic font-bold leading-tight drop-shadow-md">"{stats.commentary}"</p>
        </div>
      </div>

      {/* Danger Warning */}
      {!isCrashed && stats.speed > 0.8 && (
        <div className="absolute bottom-40 left-1/2 -translate-x-1/2 text-center pointer-events-none opacity-40">
           <div className="text-red-500 text-xs font-black uppercase tracking-[1em] animate-pulse">Extreme Traffic Hazard</div>
        </div>
      )}

      {/* Crash Screen */}
      {isCrashed && (
        <div className="absolute inset-0 bg-[#0a0000]/95 backdrop-blur-3xl pointer-events-auto flex items-center justify-center">
          <div className="text-center animate-in zoom-in slide-in-from-bottom-8 duration-500">
            <div className="mb-2 text-red-600 text-xs font-black tracking-[1em] uppercase">Sector Terminated</div>
            <h2 className="text-[10rem] font-black text-white italic uppercase tracking-tighter leading-[0.8] mb-8">WASTED</h2>
            
            <div className="grid grid-cols-2 gap-12 mb-12 border-y border-white/10 py-10">
              <div className="text-left">
                <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest mb-1">Impact Distance</p>
                <p className="text-6xl font-black text-white italic">{Math.round(stats.distance).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest mb-1">Terminal Speed</p>
                <p className="text-6xl font-black text-white italic">{speedDisplay}</p>
              </div>
            </div>

            <button 
              onClick={onReset}
              className="group relative px-16 py-6 bg-white text-black font-black uppercase tracking-[0.5em] hover:bg-red-600 hover:text-white transition-all overflow-hidden"
            >
              <span className="relative z-10">REINITIALIZE</span>
              <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-200" />
            </button>
            <div className="mt-8 text-white/20 text-[10px] uppercase tracking-[0.3em]">Neural Re-link Required</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UIOverlay;
