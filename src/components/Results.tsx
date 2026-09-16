import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Clock, Zap, RotateCcw, Menu } from 'lucide-react';
import { PlayerStats } from '../types';

interface ResultsProps {
  stats: PlayerStats;
  onRetry: () => void;
  onMenu: () => void;
}

export const Results: React.FC<ResultsProps> = ({ stats, onRetry, onMenu }) => {
  const isPodium = stats.position <= 3;
  
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const millis = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-50 p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 md:p-12 max-w-lg w-full flex flex-col items-center"
      >
        
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] ${isPodium ? 'bg-yellow-500/20 text-yellow-500' : 'bg-zinc-800 text-zinc-400'}`}>
           <Trophy className="w-10 h-10" />
        </div>

        <h2 className="text-3xl font-black italic uppercase tracking-wider text-white mb-2">
          {stats.position === 1 ? '1st Place!' : `Finished ${stats.position}${['st','nd','rd'][stats.position-1] || 'th'}`}
        </h2>
        <p className="text-zinc-400 font-medium mb-10">Stage Completed</p>

        <div className="w-full space-y-4 mb-10">
          <div className="bg-black/50 rounded-2xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-3 text-zinc-400">
              <Clock className="w-5 h-5" />
              <span className="font-bold uppercase tracking-wider text-xs">Total Time</span>
            </div>
            <div className="text-2xl font-mono font-bold text-white">
              {formatTime(stats.finishTime)}
            </div>
          </div>

          <div className="bg-black/50 rounded-2xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-3 text-zinc-400">
              <Zap className="w-5 h-5" />
              <span className="font-bold uppercase tracking-wider text-xs">Top Speed</span>
            </div>
            <div className="text-2xl font-black italic text-cyan-400">
              {stats.topSpeed} <span className="text-sm text-zinc-500">KM/H</span>
            </div>
          </div>
        </div>

        <div className="flex w-full gap-4">
          <button 
            onClick={onRetry}
            className="flex-1 bg-white text-black py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
          >
            <RotateCcw className="w-5 h-5" /> Retry
          </button>
          <button 
            onClick={onMenu}
            className="flex-1 bg-zinc-800 text-white py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-700 transition-colors"
          >
            <Menu className="w-5 h-5" /> Menu
          </button>
        </div>

      </motion.div>
    </div>
  );
};
