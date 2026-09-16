import React, { useState, useEffect, useRef } from 'react';
import { GameState, Difficulty, HUDState, PlayerStats } from './types';
import { Menu } from './components/Menu';
import { StageSelect } from './components/StageSelect';
import { HUD } from './components/HUD';
import { Results } from './components/Results';
import { RacingEngine } from './game/RacingEngine';
import { GAME_SETTINGS } from './game/constants';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [stage, setStage] = useState<number>(1);
  const [hudState, setHudState] = useState<HUDState>({ speed: 0, position: 4, totalRacers: 4, lapPercentage: 0, time: 0, countdown: 3 });
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<RacingEngine | null>(null);

  // Start Race
  const startRace = (selectedStage: number, selectedDifficulty: Difficulty) => {
    setStage(selectedStage);
    setDifficulty(selectedDifficulty);
    setGameState(GameState.RACING);
    setHudState({ speed: 0, position: 4, totalRacers: 4, lapPercentage: 0, time: 0, countdown: 3 });
  };

  useEffect(() => {
    if (gameState === GameState.RACING && canvasRef.current) {
      engineRef.current = new RacingEngine(
        canvasRef.current,
        stage,
        difficulty,
        (hud) => setHudState(hud),
        (pos, time, speed) => {
           setPlayerStats({ position: pos, finishTime: time, topSpeed: speed, completed: true });
           setGameState(GameState.RESULT);
        }
      );
      engineRef.current.start();
    }
    
    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
        engineRef.current = null;
      }
    };
  }, [gameState, stage, difficulty]);

  // Touch controls integration
  const handleTouch = (action: string, state: boolean) => {
    if (engineRef.current) {
       (engineRef.current.touchInputs as any)[action] = state;
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans select-none">
      {/* 3D Canvas (Active only when racing) */}
      <canvas 
        ref={canvasRef} 
        className={`absolute inset-0 w-full h-full ${gameState === GameState.RACING ? 'block' : 'hidden'}`}
      />

      {/* Touch Controls Overlay (Mobile only, when racing) */}
      {gameState === GameState.RACING && (
        <div className="absolute inset-0 z-50 pointer-events-none md:hidden flex justify-between items-end p-4 pb-8">
           <div className="flex gap-2 pointer-events-auto">
             <button 
               onPointerDown={() => handleTouch('left', true)}
               onPointerUp={() => handleTouch('left', false)}
               onPointerLeave={() => handleTouch('left', false)}
               className="w-16 h-16 bg-white/10 active:bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white/50 text-2xl font-bold"
             >
               &lt;
             </button>
             <button 
               onPointerDown={() => handleTouch('right', true)}
               onPointerUp={() => handleTouch('right', false)}
               onPointerLeave={() => handleTouch('right', false)}
               className="w-16 h-16 bg-white/10 active:bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white/50 text-2xl font-bold"
             >
               &gt;
             </button>
           </div>
           
           <div className="flex gap-2 pointer-events-auto">
             <button 
               onPointerDown={() => handleTouch('down', true)}
               onPointerUp={() => handleTouch('down', false)}
               onPointerLeave={() => handleTouch('down', false)}
               className="w-16 h-16 bg-red-500/20 active:bg-red-500/50 border border-red-500/50 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white/50 text-xs font-bold uppercase"
             >
               Brake
             </button>
             <button 
               onPointerDown={() => handleTouch('up', true)}
               onPointerUp={() => handleTouch('up', false)}
               onPointerLeave={() => handleTouch('up', false)}
               className="w-20 h-20 bg-cyan-500/20 active:bg-cyan-500/50 border border-cyan-500/50 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white/80 text-sm font-bold uppercase mb-4 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
             >
               Gas
             </button>
           </div>
        </div>
      )}

      {/* UI Layers */}
      {gameState === GameState.MENU && (
        <Menu onStart={() => setGameState(GameState.STAGE_SELECT)} />
      )}

      {gameState === GameState.STAGE_SELECT && (
        <StageSelect 
           onSelect={startRace} 
           onBack={() => setGameState(GameState.MENU)} 
        />
      )}

      {gameState === GameState.RACING && (
        <HUD state={hudState} maxSpeed={GAME_SETTINGS.maxSpeed} />
      )}

      {gameState === GameState.RESULT && playerStats && (
        <Results 
          stats={playerStats} 
          onRetry={() => startRace(stage, difficulty)}
          onMenu={() => setGameState(GameState.MENU)}
        />
      )}

    </div>
  );
}
