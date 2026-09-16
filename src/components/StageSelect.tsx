import React from 'react';
import { motion } from 'motion/react';
import { Difficulty } from '../types';
import { ArrowLeft, Map, Star } from 'lucide-react';

interface StageSelectProps {
  onSelect: (stage: number, difficulty: Difficulty) => void;
  onBack: () => void;
}

export const StageSelect: React.FC<StageSelectProps> = ({ onSelect, onBack }) => {
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<Difficulty>(Difficulty.MEDIUM);
  const stages = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className="absolute inset-0 bg-zinc-950 text-white z-50 p-8 flex flex-col overflow-y-auto">
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-6 mb-12">
          <button 
            onClick={onBack}
            className="p-3 bg-zinc-900 rounded-full hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-4xl font-black uppercase italic tracking-wider">Select Event</h2>
            <p className="text-zinc-400 font-medium">Choose your stage and difficulty</p>
          </div>
        </div>

        {/* Difficulty Selector */}
        <div className="flex justify-center gap-4 mb-12">
          {Object.values(Difficulty).map(diff => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm transition-all ${
                selectedDifficulty === diff 
                  ? 'bg-white text-black scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        {/* Stage Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {stages.map(stage => (
            <motion.button
              key={stage}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(stage, selectedDifficulty)}
              className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 z-0"></div>
              <Map className="w-10 h-10 text-zinc-500 group-hover:text-cyan-400 transition-colors z-10" />
              <div className="text-center z-10">
                <div className="text-xs text-zinc-400 font-bold uppercase tracking-widest mb-1">Stage</div>
                <div className="text-4xl font-black italic">{stage}</div>
              </div>
              
              {/* Stars indicating difficulty scale implicit to stage */}
              <div className="flex gap-1 z-10 opacity-50">
                {Array.from({ length: Math.ceil(stage / 2) }).map((_, i) => (
                   <Star key={i} className="w-3 h-3 fill-current text-yellow-500" />
                ))}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};
