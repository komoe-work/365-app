import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioGuide } from '../types';

interface StickyMiniPlayerProps {
  currentlyPlayingAudio: AudioGuide | null;
  onClose: () => void;
  lang: 'my' | 'en';
}

const StickyMiniPlayer: React.FC<StickyMiniPlayerProps> = ({ 
  currentlyPlayingAudio, 
  onClose,
  lang 
}) => {
  const [isPlaying, setIsPlaying] = useState(true);

  if (!currentlyPlayingAudio) return null;

  const toMyanmarDigits = (num: number) => {
    const myDigits = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'];
    return num.toString().split('').map(d => myDigits[parseInt(d)] || d).join('');
  };

  const dayDisplay = lang === 'my' ? toMyanmarDigits(currentlyPlayingAudio.id) : currentlyPlayingAudio.id;
  const dayLabel = lang === 'my' ? 'နေ့ရက်' : 'Day';

  return (
    <AnimatePresence>
      {currentlyPlayingAudio && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[80] w-full max-w-md px-4 pb-[env(safe-area-inset-bottom)]"
        >
          <div className="glass-card rounded-2xl p-3 border border-[#D4AF37]/40 shadow-[0_10px_40px_rgba(0,0,0,0.4)] flex items-center gap-4 backdrop-blur-xl bg-[#051a12]/80">
            {/* Audio Info */}
            <div className="flex-1 min-w-0 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#B8860B] flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-white font-bold text-xs">
                  {dayDisplay}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider">
                  {dayLabel} {dayDisplay}
                </p>
                <h4 className="text-white text-xs font-medium truncate">
                  {lang === 'my' ? currentlyPlayingAudio.titleMy : currentlyPlayingAudio.titleEn || currentlyPlayingAudio.fileName}
                </h4>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all active:scale-90"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors"
                aria-label="Close Player"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyMiniPlayer;
