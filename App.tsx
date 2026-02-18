
import React, { useState, useCallback, useEffect } from 'react';
import { GameState, PlayerStats } from './types';
import Menu from './components/Menu';
import UIOverlay from './components/UIOverlay';
import GameScene from './components/GameScene';
import { getAICommentary } from './services/geminiService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('neon_high_score')) || 0);
  const [stats, setStats] = useState<PlayerStats>({
    speed: 0,
    distance: 0,
    highScore: highScore,
    commentary: "System online. Awaiting pilot input."
  });

  const handleStartGame = () => {
    setGameState(GameState.RACING);
    setStats(prev => ({
      ...prev,
      distance: 0,
      commentary: "Ignition. Burn the grid."
    }));
  };

  const handleUpdate = useCallback((speed: number, distance: number) => {
    setStats(prev => ({
      ...prev,
      speed,
      distance
    }));
  }, []);

  const handleCrash = useCallback(async () => {
    if (gameState === GameState.CRASHED) return;
    
    setGameState(GameState.CRASHED);
    if (stats.distance > highScore) {
      setHighScore(stats.distance);
      localStorage.setItem('neon_high_score', stats.distance.toString());
    }

    const comm = await getAICommentary("CRASH", stats);
    setStats(prev => ({ ...prev, commentary: comm }));
  }, [gameState, stats, highScore]);

  // Periodic Commentary
  useEffect(() => {
    if (gameState !== GameState.RACING) return;
    
    const interval = setInterval(async () => {
      const comm = await getAICommentary("RACING", stats);
      setStats(prev => ({ ...prev, commentary: comm }));
    }, 8000);
    
    return () => clearInterval(interval);
  }, [gameState, stats]);

  return (
    <div className="relative w-full h-screen bg-[#050505] text-white overflow-hidden">
      {gameState === GameState.MENU && (
        <Menu onStart={handleStartGame} highScore={highScore} />
      )}

      {(gameState === GameState.RACING || gameState === GameState.CRASHED) && (
        <>
          <GameScene 
            gameState={gameState} 
            onUpdate={handleUpdate} 
            onCrash={handleCrash} 
          />
          <UIOverlay 
            stats={stats} 
            gameState={gameState} 
            onReset={() => setGameState(GameState.MENU)} 
          />
        </>
      )}
    </div>
  );
};

export default App;
