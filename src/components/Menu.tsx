import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Play, Settings, ChevronRight } from 'lucide-react';

interface MenuProps {
  onStart: () => void;
}

export const Menu: React.FC<MenuProps> = ({ onStart }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 text-white z-50">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-600 drop-shadow-lg">
          APEX
        </h1>
        <h2 className="text-4xl md:text-6xl font-black italic tracking-widest text-zinc-300 -mt-2">
          VELOCITY
        </h2>
        <div className="h-1 w-24 bg-cyan-500 mx-auto mt-6 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col gap-4 w-64"
      >
        <button 
          onClick={onStart}
          className="group relative flex items-center justify-center gap-2 bg-white text-black py-4 px-8 rounded-full font-bold text-xl uppercase tracking-wider overflow-hidden transition-transform hover:scale-105 active:scale-95"
        >
          <div className="absolute inset-0 w-0 bg-cyan-400 transition-all duration-300 ease-out group-hover:w-full z-0"></div>
          <span className="relative z-10 flex items-center gap-2">
            <Play className="w-6 h-6 fill-current" /> Play Now
          </span>
        </button>

        <button className="flex items-center justify-between bg-zinc-900 border border-zinc-800 text-zinc-400 py-3 px-6 rounded-full font-semibold uppercase tracking-wider hover:bg-zinc-800 hover:text-white transition-colors">
          <span>Settings</span>
          <Settings className="w-5 h-5" />
        </button>
      </motion.div>

      <div className="absolute bottom-8 text-zinc-600 text-sm font-medium tracking-widest">
        VERSION 1.0.0
      </div>
    </div>
  );
};
