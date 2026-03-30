
import React from 'react';

interface InstallModalProps {
  type: 'ios' | 'android';
  t: any;
  onClose: () => void;
}

const InstallModal: React.FC<InstallModalProps> = ({ type, t, onClose }) => {
  const isIos = type === 'ios';
  
  return (
    <div 
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-modal-title"
    >
      <div className="glass-card w-full max-w-sm rounded-[2.5rem] p-8 border-2 border-[#D4AF37]/40 relative overflow-hidden shadow-2xl text-center">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full -mr-16 -mt-16" aria-hidden="true"></div>
        <div className="relative z-10">
          <div className="w-16 h-16 bg-[#B8860B]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            {isIos ? (
              <svg className="w-8 h-8 text-[#B8860B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
            ) : (
              <svg className="w-8 h-8 text-[#B8860B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            )}
          </div>
          <h3 id="install-modal-title" className="text-xl font-bold gold-text mb-4">{t.iosInstallTitle}</h3>
          <p className="text-white/80 text-sm leading-relaxed mb-8">
            {isIos ? t.iosInstallDesc : t.androidInstallDesc}
          </p>
          <button 
            onClick={onClose}
            className="w-full py-4 bg-[#B8860B] text-white rounded-2xl font-bold shadow-lg hover:bg-[#9a700a] transition-all active-scale border border-[#FCF6BA]/30"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallModal;
