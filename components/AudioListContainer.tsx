import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioGuide } from '../types';
import AudioCard from './AudioCard';

interface AudioListContainerProps {
  audioGuides: AudioGuide[];
  onPlay: (guide: AudioGuide) => void;
  onToggleDone: (id: number) => void;
  firstUncompletedId: number | undefined;
  t: {
    play: string;
    dayLabel: string;
  };
  lang: 'my' | 'en';
}

const AudioListContainer: React.FC<AudioListContainerProps> = ({
  audioGuides,
  onPlay,
  onToggleDone,
  firstUncompletedId,
  t,
  lang
}) => {
  // Helper to convert numbers to Myanmar digits
  const toMyanmarDigits = (num: number) => {
    const myDigits = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'];
    return num.toString().split('').map(d => myDigits[parseInt(d)] || d).join('');
  };

  // Group audio guides into months (30 days each)
  const months = useMemo(() => {
    const groups: AudioGuide[][] = [];
    for (let i = 0; i < audioGuides.length; i += 30) {
      groups.push(audioGuides.slice(i, i + 30));
    }
    return groups;
  }, [audioGuides]);

  // Find the month containing the first uncompleted item to open it by default
  const defaultOpenMonth = useMemo(() => {
    if (!firstUncompletedId) return 0;
    return Math.floor((firstUncompletedId - 1) / 30);
  }, [firstUncompletedId]);

  const [openMonth, setOpenMonth] = useState<number | null>(defaultOpenMonth);

  const toggleMonth = (index: number) => {
    setOpenMonth(openMonth === index ? null : index);
  };

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 -mr-2 custom-scrollbar pb-4">
      {months.map((monthItems, index) => {
        const isOpen = openMonth === index;
        const monthNumber = index + 1;
        const myMonthNumber = toMyanmarDigits(monthNumber);
        const completedCount = monthItems.filter(item => item.isCompleted).length;
        const totalCount = monthItems.length;
        const isFullyCompleted = completedCount === totalCount;

        return (
          <div 
            key={index} 
            className={`rounded-3xl overflow-hidden border transition-all duration-300 ${
              isOpen 
                ? 'bg-white/10 border-[#D4AF37]/40 shadow-xl' 
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            {/* Month Header */}
            <button
              onClick={() => toggleMonth(index)}
              className="w-full px-6 py-4 flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all ${
                  isFullyCompleted 
                    ? 'bg-[#B8860B] text-white shadow-lg' 
                    : 'bg-white/10 text-white/60 group-hover:bg-white/20'
                }`}>
                  {lang === 'my' ? myMonthNumber : monthNumber}
                </div>
                <div>
                  <h3 className={`font-bold transition-colors ${isOpen ? 'gold-text' : 'text-white/90'}`}>
                    {lang === 'my' ? `${myMonthNumber} လ` : `Month ${monthNumber}`}
                  </h3>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">
                    {lang === 'my' 
                      ? `${toMyanmarDigits(completedCount)} / ${toMyanmarDigits(totalCount)} ပြီးစီးမှု` 
                      : `${completedCount} / ${totalCount} Completed`}
                  </p>
                </div>
              </div>
              
              <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Month Content (Grid of AudioCards) */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <div className="px-6 pb-6 pt-2">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                      {monthItems.map((guide) => (
                        <AudioCard 
                          key={guide.id}
                          guide={guide}
                          onPlay={onPlay}
                          onToggleDone={onToggleDone}
                          isHighlighted={guide.id === firstUncompletedId}
                          t={{ play: t.play, dayLabel: t.dayLabel }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default AudioListContainer;
