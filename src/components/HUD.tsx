import React from 'react';
import { motion } from 'motion/react';
import { GameState, Difficulty, HUDState } from '../types';
import { Flag, Timer, Zap, Users } from 'lucide-react';

interface HUDProps {
  state: HUDState;
  maxSpeed: number;
}

export const HUD: React.FC<HUDProps> = ({ state, maxSpeed }) => {
  const speedPercentage = (state.speed / maxSpeed) * 100;
  
  // Format time (ms) to MM:SS:ms
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const millis = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${millis.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      
      {/* Top Left: Position & Lap */}
      <div className="absolute top-6 left-6 flex flex-col gap-4">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-4">
          <div className="bg-cyan-500/20 p-2 rounded-xl">
            <Users className="text-cyan-400 w-6 h-6" />
          </div>
          <div>
            <div className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Position</div>
            <div className="text-white text-3xl font-black italic">
              {state.position} <span className="text-zinc-500 text-lg">/ {state.totalRacers}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Right: Time & Progress */}
      <div className="absolute top-6 right-6 flex flex-col items-end gap-4">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-4">
          <div className="text-right">
            <div className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Time</div>
            <div className="text-white text-2xl font-mono font-bold tracking-tighter">
              {formatTime(state.time)}
            </div>
          </div>
          <div className="bg-white/10 p-2 rounded-xl">
            <Timer className="text-white w-6 h-6" />
          </div>
        </div>

        <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-full py-2 px-4 flex items-center gap-3">
          <Flag className="w-4 h-4 text-zinc-400" />
          <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
              style={{ width: `${state.lapPercentage}%` }}
            />
          </div>
          <span className="text-white text-xs font-bold font-mono">{state.lapPercentage}%</span>
        </div>
      </div>

      {/* Bottom Right: Speedometer */}
      <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12">
        <div className="relative flex items-center justify-center">
          {/* Circular dial background */}
          <svg className="w-40 h-40 transform -rotate-90">
            <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
            <circle 
              cx="80" cy="80" r="70" fill="none" 
              stroke={state.speed > maxSpeed * 0.8 ? '#ef4444' : '#06b6d4'} 
              strokeWidth="10"
              strokeDasharray="440"
              strokeDashoffset={440 - (440 * speedPercentage) / 100}
              className="transition-all duration-100"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <div className="flex items-end">
                <span className="text-5xl font-black italic text-white tracking-tighter">{state.speed}</span>
            </div>
            <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest mt-1">KM/H</span>
          </div>
        </div>
      </div>

      {/* Countdown overlay */}
      {state.countdown >= 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div
            key={state.countdown}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className={`text-9xl font-black italic tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] ${
              state.countdown === 0 ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {state.countdown === 0 ? 'GO!' : state.countdown}
          </motion.div>
        </div>
      )}
    </div>
  );
};
