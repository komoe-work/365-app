import React from 'react';
import { motion } from 'framer-motion';
import { AudioGuide } from '../types';

interface UpNextCardProps {
  nextAudio: AudioGuide | undefined;
  onPlay: (guide: AudioGuide) => void;
  t: {
    play: string;
    dayLabel: string;
    upNext: string;
    continueJourney: string;
  };
  lang: 'my' | 'en';
}

const UpNextCard: React.FC<UpNextCardProps> = ({ nextAudio, onPlay, t, lang }) => {
  if (!nextAudio) return null;

  // Helper to convert numbers to Myanmar digits
  const toMyanmarDigits = (num: number) => {
    const myDigits = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'];
    return num.toString().split('').map(d => myDigits[parseInt(d)] || d).join('');
  };

  const dayDisplay = lang === 'my' ? toMyanmarDigits(nextAudio.id) : nextAudio.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mb-10 relative group"
    >
      {/* Decorative Glow Background */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#D4AF37]/20 to-[#B8860B]/20 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
      
      <div className="glass-card relative rounded-[2.5rem] p-8 md:p-10 border-2 border-[#D4AF37]/50 shadow-2xl overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full -mr-32 -mt-32 blur-3xl" aria-hidden="true"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/5 rounded-full -ml-24 -mb-24 blur-3xl" aria-hidden="true"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.2em]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]"></span>
              </span>
              {t.upNext}
            </div>
            
            <div className="space-y-1">
              <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
                {t.continueJourney}
              </h2>
              <p className="text-xl md:text-2xl gold-text font-bold">
                {t.dayLabel} {dayDisplay}
              </p>
            </div>

            {nextAudio.fileName && (
              <p className="text-teal-100/60 text-sm italic max-w-md">
                "{nextAudio.fileName}"
              </p>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onPlay(nextAudio)}
            className="flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-[#B8860B] to-[#D4AF37] rounded-full text-white font-bold shadow-[0_10px_30px_rgba(184,134,11,0.4)] hover:shadow-[0_15px_40px_rgba(184,134,11,0.6)] transition-all group/btn relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
            <span className="relative z-10 text-lg">{t.play}</span>
            <div className="relative z-10 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 fill-current ml-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default UpNextCard;
