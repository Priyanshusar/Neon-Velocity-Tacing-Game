
import React from 'react';

interface MenuProps {
  onStart: () => void;
  highScore: number;
}

const Menu: React.FC<MenuProps> = ({ onStart, highScore }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-[#050505]">
      {/* Animated Background Scanlines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      </div>

      <div className="relative text-center mb-16 animate-pulse">
        <h1 className="text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-cyan-400 via-fuchsia-500 to-purple-600 uppercase">
          NEON<br/>VELOCITY
        </h1>
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent mt-2" />
      </div>

      <div className="flex flex-col gap-6 w-80 relative z-10">
        <button 
          onClick={onStart}
          className="group relative px-8 py-5 bg-transparent border-2 border-cyan-400 text-cyan-400 font-black text-2xl uppercase tracking-[0.3em] overflow-hidden transition-all hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_30px_rgba(34,211,238,0.6)]"
        >
          <span className="relative z-10">INITIATE RACE</span>
          <div className="absolute inset-0 bg-white translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
        </button>
        
        <div className="text-center">
          <p className="text-fuchsia-500 text-xs font-bold tracking-widest uppercase mb-1">Sector High Score</p>
          <p className="text-white text-3xl font-mono">{Math.round(highScore)}m</p>
        </div>
      </div>

      <div className="mt-20 flex gap-12 text-gray-500 text-[10px] tracking-[0.5em] uppercase font-bold">
        <span>WASD TO STEER</span>
        <span>SPACE TO BOOST</span>
        <span>ESCAPE TO ABORT</span>
      </div>
    </div>
  );
};

export default Menu;
