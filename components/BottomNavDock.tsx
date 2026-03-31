import React, { useState, useEffect } from 'react';

interface BottomNavDockProps {
  isStandalone: boolean;
  handleInstallClick: () => void;
  lang: 'my' | 'en';
  setLang: (lang: 'my' | 'en') => void;
  handleAdminLinkClick: (url: string) => void;
  t: any;
  SHEET_URL: string;
  DRIVE_FOLDER_URL: string;
}

const BottomNavDock: React.FC<BottomNavDockProps> = ({
  isStandalone,
  handleInstallClick,
  lang,
  setLang,
  handleAdminLinkClick,
  t,
  SHEET_URL,
  DRIVE_FOLDER_URL
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[90] w-full max-w-md px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]" aria-label="Main Navigation">
      <div className="glass-card rounded-full p-2 border-2 border-[#D4AF37]/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between gap-2 backdrop-blur-xl bg-black/40 relative">
        
        {/* Offline Indicator */}
        {!isOnline && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-500/90 backdrop-blur-md text-white text-[10px] px-3 py-1.5 rounded-full font-bold shadow-lg animate-pulse flex items-center gap-1.5 border border-red-400/50 whitespace-nowrap">
            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            Offline Mode
          </div>
        )}

        {!isStandalone && (
          <button 
            onClick={handleInstallClick}
            className="flex-1 bg-white/5 hover:bg-white/10 p-3 rounded-full flex flex-col items-center justify-center gap-1 transition-all active:scale-90 border border-white/10"
            title={t.installApp}
            aria-label={t.installApp}
          >
            <svg className="w-5 h-5 text-[#B8860B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            <span className="text-[8px] font-bold text-white/60 uppercase tracking-tighter">Install</span>
          </button>
        )}
        
        <button 
          onClick={() => setLang(lang === 'my' ? 'en' : 'my')} 
          className="flex-1 bg-white/5 hover:bg-white/10 p-3 rounded-full flex flex-col items-center justify-center gap-1 transition-all active:scale-90 border border-white/10 relative group"
          title={lang === 'my' ? "Switch to English" : "မြန်မာဘာသာသို့ ပြောင်းရန်"}
          aria-label={lang === 'my' ? "Switch to English" : "မြန်မာဘာသာသို့ ပြောင်းရန်"}
        >
          <div className="relative">
            <svg className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-[#B8860B] text-[6px] font-bold text-white ring-1 ring-black/50">
              {lang === 'my' ? 'MY' : 'EN'}
            </span>
          </div>
          <span className="text-[8px] font-bold text-white/60 uppercase tracking-tighter">Language</span>
        </button>

        <button 
          onClick={() => handleAdminLinkClick(SHEET_URL)} 
          className="flex-1 bg-white/5 hover:bg-white/10 p-3 rounded-full flex flex-col items-center justify-center gap-1 transition-all active:scale-90 border border-white/10"
          title={t.googleSheet}
          aria-label={t.googleSheet}
        >
          <svg className="w-5 h-5 text-white/80" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2zM19 19H5V4h8v4h4v11zM7 10h10v2H7v-2zm0 4h10v2H7v-2z"/></svg>
          <span className="text-[8px] font-bold text-white/60 uppercase tracking-tighter">Sheet</span>
        </button>

        <button 
          onClick={() => handleAdminLinkClick(DRIVE_FOLDER_URL)} 
          className="flex-1 bg-[#B8860B] hover:bg-[#9a700a] p-3 rounded-full flex flex-col items-center justify-center gap-1 transition-all active:scale-95 border border-[#FCF6BA]/30 shadow-lg"
          title={t.fullLibrary}
          aria-label={t.fullLibrary}
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          <span className="text-[8px] font-bold text-white uppercase tracking-tighter">Library</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNavDock;
