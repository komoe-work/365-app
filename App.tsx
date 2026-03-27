
import React, { useState, useEffect } from 'react';
import { AudioGuide } from './types';

/**
 * AUDIO LINK SYSTEM
 * The app now automatically fetches links from your Google Sheet!
 * Sheet: https://docs.google.com/spreadsheets/d/14y9p-Z35NCNWlgOiiBY39epO9M44cESG7mlVwEJcAYM/edit?usp=sharing
 * 
 * To add more days:
 * 1. Add a new row to the Google Sheet.
 * 2. Column B should be "Day X".
 * 3. Column D should be the Myanmar description/filename.
 * 4. Column E should be the Google Drive Share Link.
 */
const AUDIO_LINKS: Record<number, string> = {
  // Hardcoded fallbacks for the first 5 days
  1: "1g4hPMTpBQwRFi8_hBOGwKP-RRwrzi2V8",
  2: "1DhMZwrsySWsOxUNd1wGJka7ioVSFsjFv",
  3: "1ebxI0V0-E06HtolmyU5mmw2TuXYgEHVi",
  4: "1W7hGLOw2sTE_peSRCGRYg2XiIZ_OEvxu",
  5: "1oVaoll-xKEPzaOjyZxKn7aqXxCMZQk55",
};

const getDriveUrl = (id: string) => `https://drive.google.com/file/d/${id}/view`;

const INITIAL_AUDIO: AudioGuide[] = Array.from({ length: 365 }, (_, i) => {
  const day = i + 1;
  return {
    id: day,
    titleEn: `Day ${day}`,
    titleMy: `နေ့ရက် (${day})`,
    isCompleted: false,
    audioUrl: AUDIO_LINKS[day] ? getDriveUrl(AUDIO_LINKS[day]) : undefined
  };
});

const STORAGE_KEY = 'mindful_project_v3';
const LANG_KEY = 'mindfulness_lang_pref';
const SHEET_URL = "https://docs.google.com/spreadsheets/d/14y9p-Z35NCNWlgOiiBY39epO9M44cESG7mlVwEJcAYM/edit?usp=sharing";
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/14y9p-Z35NCNWlgOiiBY39epO9M44cESG7mlVwEJcAYM/export?format=csv";
const DRIVE_FOLDER_URL = "https://drive.google.com/drive/folders/19MedBT6RlbzVxyU5OM8Ec3-5uod0eJno?usp=sharing";
const PATRON_WEBSITE_URL = "https://drsoelwin.mindset-it.online/";
const AUDIO_SUMMARY_URL = "https://dl-audio-to-ebooks.pages.dev/";
const NOTEBOOK_LM_URL = "https://notebooklm.google.com/notebook/5c693072-7f7a-40a2-84da-8060c1213a8d";

type Language = 'my' | 'en';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem(LANG_KEY) as Language) || 'my');
  const [audioGuides, setAudioGuides] = useState<AudioGuide[]>(INITIAL_AUDIO);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<AudioGuide | null>(null);
  
  const [hasScrolled, setHasScrolled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIosModal, setShowIosModal] = useState(false);
  const [showAndroidModal, setShowAndroidModal] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  const todayDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
      setIsStandalone(!!isStandaloneMode);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    checkStandalone();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    const fetchSheetData = async () => {
      try {
        const response = await fetch(SHEET_CSV_URL);
        const csvText = await response.text();
        const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '').slice(1); // Skip header and empty lines
        
        const links: Record<number, { id: string, fileName: string, shareLink: string, date?: string, explanation?: string }> = {};
        lines.forEach(line => {
          // Robust CSV parsing (handling potential quotes and commas inside quotes)
          const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          
          // Based on user's new sheet format: 
          // Column A (parts[0]) = No.
          // Column B (parts[1]) = Day Count (e.g., "Day 1")
          // Column C (parts[2]) = Date (DD-MM-YYYY)
          // Column D (parts[3]) = File Name (Myanmar Text)
          // Column E (parts[4]) = Share Link
          if (parts.length >= 5) {
            const noText = parts[0].replace(/^"|"$/g, '').trim();
            const dayText = parts[1].replace(/^"|"$/g, '').trim();
            const date = parts[2].replace(/^"|"$/g, '').trim();
            const fileName = parts[3].replace(/^"|"$/g, '').trim();
            const shareLink = parts[4].replace(/[<>"\s]/g, '').replace(/^"|"$/g, '');
            
            // Extract Day Number from "Day X" or the "No." column
            const dayMatch = dayText.match(/Day\s*(\d+)/i) || noText.match(/^(\d+)$/);
            if (dayMatch) {
              const dayNum = parseInt(dayMatch[1]);
              const fileIdMatch = shareLink.match(/id=([^&]+)/) || shareLink.match(/\/d\/([^/]+)/);
              
              if (fileIdMatch) {
                links[dayNum] = { 
                  id: fileIdMatch[1], 
                  fileName: fileName || dayText, // Use Myanmar filename if available
                  shareLink, 
                  date
                };
              }
            }
          }
        });

        if (Object.keys(links).length > 0) {
          setAudioGuides(prev => prev.map(guide => {
            const sheetData = links[guide.id];
            if (!sheetData) return guide;

            return {
              ...guide,
              audioUrl: getDriveUrl(sheetData.id),
              fileName: sheetData.fileName,
              shareLink: sheetData.shareLink,
              date: sheetData.date || guide.date,
              explanation: sheetData.fileName // Using the Myanmar filename as explanation/title
            };
          }));
        }
      } catch (error) {
        console.error("Error fetching sheet data:", error);
      }
    };

    fetchSheetData();
  }, []);

  useEffect(() => {
    if (!hasScrolled && audioGuides.length > 0) {
      const firstUncompleted = audioGuides.findIndex(g => !g.isCompleted);
      if (firstUncompleted > 0) {
        setTimeout(() => {
          const container = document.querySelector('.custom-scrollbar');
          if (container) {
            const buttons = container.querySelectorAll('button');
            if (buttons[firstUncompleted]) {
              buttons[firstUncompleted].scrollIntoView({ behavior: 'smooth', block: 'center' });
              setHasScrolled(true);
            }
          }
        }, 500);
      }
    }
  }, [audioGuides]);

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const dayNum = date.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const month = months[date.getMonth()];
    const dayName = days[date.getDay()];
    return `${dayName}, ${dayNum} ${month}`;
  };

  const loadInitialData = async () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === todayDate) {
        setAudioGuides(parsed.audioGuides || INITIAL_AUDIO);
      }
    }
  };

  const saveAndSync = async (updatedAudio: AudioGuide[]) => {
    const stateToSave = { date: todayDate, audioGuides: updatedAudio };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  };

  const toggleAudio = (id: number) => {
    const updated = audioGuides.map(a => a.id === id ? { ...a, isCompleted: !a.isCompleted } : a);
    setAudioGuides(updated);
    saveAndSync(updated);
  };

  const playAudio = (guide: AudioGuide) => {
    setSelectedAudio(guide);
  };

  const listenNow = (guide: AudioGuide) => {
    if (guide.audioUrl) {
      window.open(guide.audioUrl, '_blank');
    } else {
      // If no specific URL, open the main folder
      window.open(DRIVE_FOLDER_URL, '_blank');
    }
  };

  const t = {
    titleEn: "Dhammalann Meditation",
    audioTitle: lang === 'my' ? "တရားတော်များ နာယူရန်" : "Audio Sanctuary",
    audioSubtitle: lang === 'my' ? "တစ်နှစ်တာ နေ့စဉ် နာယူရန်" : "365 Days Journey",
    googleSheet: lang === 'my' ? "Google Sheet ကြည့်ရန်" : "View Google Sheet",
    fullLibrary: lang === 'my' ? "တရားတော်များအားလုံး" : "Full Audio Library",
    completed: lang === 'my' ? "ပြီး" : "Done",
    play: lang === 'my' ? "နာယူရန်" : "Play",
    dayLabel: lang === 'my' ? "နေ့ရက်" : "Day",
    listenNow: lang === 'my' ? "ယခုနာယူရန်" : "Listen Now",
    explanation: lang === 'my' ? "ရှင်းလင်းချက်" : "Explanation",
    close: lang === 'my' ? "ပိတ်ရန်" : "Close",
    patronInfo: lang === 'my' ? "ဝိသုဒ္ဓိမဂ်ဓမ္မလမ်းဝိပဿနာအဖွဲ့များ၏ ဦးဆောင်နာယက၊ မဟာသဒ္ဓမ္မဇောတိကဓဇ ဆရာကြီးဒေါက်တာစိုးလွင်(မန္တလေး)" : "Patron of Visuddhimag Dhamma Lann Vipassana Organizations, Mahasaddhamajawtikadaja Dr. Soe Lwin (Mandalay)",
    visitWebsite: lang === 'my' ? "ကိုယ်ရေးအကျဉ်း ကြည့်ရန်" : "Visit Biography Website",
    audioSummary: lang === 'my' ? "တရားတော်များ အနှစ်ချုပ်" : "Audio Summary",
    notebookLM: "NotebookLM",
    installApp: lang === 'my' ? "App ထည့်သွင်းရန်" : "Install App",
    iosInstallTitle: lang === 'my' ? "App ထည့်သွင်းနည်း" : "How to Install",
    iosInstallDesc: lang === 'my' ? "App ထည့်သွင်းရန်: သင့်ဖုန်း၏ Share icon ကိုနှိပ်ပြီး 'Add to Home Screen' ကိုရွေးချယ်ပါ။" : "To install: Tap the Share icon at the bottom of your screen, then select 'Add to Home Screen'.",
    androidInstallDesc: lang === 'my' ? "App ထည့်သွင်းရန်: ဘရောက်ဇာမီနူး (အစက်သုံးစက်) ကိုနှိပ်ပြီး 'Install app' သို့မဟုတ် 'Add to Home screen' ကိုရွေးချယ်ပါ။" : "To install: Tap the browser menu (three dots) at the top right, then select 'Install app' or 'Add to Home screen'."
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIos = /iphone|ipad|ipod/.test(userAgent);
      if (isIos) {
        setShowIosModal(true);
      } else {
        setShowAndroidModal(true);
      }
    }
  };

  const firstUncompletedId = audioGuides.find(g => !g.isCompleted)?.id;

  return (
    <main id="main-content" className={`max-w-2xl mx-auto px-4 py-6 md:py-12 relative ${lang === 'my' ? 'lang-my' : ''}`}>
      <header className="text-center mb-16 fade-content relative pt-12">
        <h1 className={`font-bold mb-2 text-balance break-keep ${lang === 'my' ? 'text-[22px] sm:text-3xl md:text-4xl leading-[1.6]' : 'text-2xl md:text-3xl leading-tight'}`}>
          {lang === 'my' ? (
            <>ဓမ္မလမ်း ဝိပဿနာ</>
          ) : (
            <>Dhammalann Meditation</>
          )}
        </h1>
        <div className="h-0.5 w-10 bg-[#B8860B] mx-auto rounded-full opacity-30" aria-hidden="true"></div>
      </header>

      {/* Audio Section - PRIMARY FOCUS */}
      <section className="glass-card rounded-[2.5rem] p-6 md:p-10 mb-8 text-white shadow-2xl relative overflow-hidden fade-content border-2 border-[#D4AF37]/30">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full -mr-16 -mt-16" aria-hidden="true"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className={lang === 'my' ? 'leading-relaxed' : ''}>
              <h2 className="text-xl font-bold gold-text">{t.audioTitle}</h2>
              <p className="text-teal-100/70 text-xs italic">{t.audioSubtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              {!isStandalone && (
                <button 
                  onClick={handleInstallClick}
                  className="bg-white/10 p-3 rounded-2xl shadow-lg active:scale-90 transition-transform hover:bg-white/20 border border-white/20 flex items-center justify-center gap-2"
                  title={t.installApp}
                  aria-label={t.installApp}
                >
                  <svg className="w-5 h-5 text-[#B8860B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                  <span className="hidden sm:inline text-[10px] font-bold text-white tracking-widest uppercase">{t.installApp}</span>
                </button>
              )}
              <button 
                onClick={() => setLang(lang === 'my' ? 'en' : 'my')} 
                className="bg-white/10 p-3 rounded-2xl shadow-lg active:scale-90 transition-transform hover:bg-white/20 border border-white/20 flex items-center justify-center min-w-[44px]"
                title={lang === 'my' ? "Switch to English" : "မြန်မာဘာသာသို့ ပြောင်းရန်"}
                aria-label={lang === 'my' ? "Switch to English" : "မြန်မာဘာသာသို့ ပြောင်းရန်"}
              >
                <span className="text-[10px] font-bold text-white tracking-widest">{lang === 'my' ? 'EN' : 'MY'}</span>
              </button>
              <a href={SHEET_URL} target="_blank" rel="noopener noreferrer" title={t.googleSheet} aria-label={t.googleSheet} className="bg-white/10 p-3 rounded-2xl shadow-lg active:scale-90 transition-transform hover:bg-white/20 border border-white/20">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2zM19 19H5V4h8v4h4v11zM7 10h10v2H7v-2zm0 4h10v2H7v-2z"/></svg>
              </a>
              <a href={DRIVE_FOLDER_URL} target="_blank" rel="noopener noreferrer" title={t.fullLibrary} aria-label={t.fullLibrary} className="bg-[#B8860B] p-3 rounded-2xl shadow-lg active:scale-90 transition-transform hover:bg-[#9a700a] border border-[#FCF6BA]/30">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              </a>
            </div>
          </div>
          <div className="max-h-[500px] overflow-y-auto pr-2 -mr-2 custom-scrollbar">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {audioGuides.map((guide) => (
                <div key={guide.id} className="relative group">
                  {/* Main Action: Play Audio */}
                  <button 
                    onClick={() => playAudio(guide)} 
                    className={`w-full flex flex-col items-center justify-center pt-7 pb-4 rounded-2xl transition-all border-2 active-scale relative ${guide.isCompleted ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30' : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'} ${guide.id === firstUncompletedId ? 'ring-2 ring-[#D4AF37] ring-offset-2 ring-offset-[#051a12]' : ''}`}
                    aria-label={`${t.play} ${t.dayLabel} ${guide.id}`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all ${guide.audioUrl ? 'bg-[#B8860B] text-white shadow-xl group-hover:scale-110' : 'bg-white/10 text-white/40'}`}>
                      {guide.audioUrl ? (
                        <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/></svg>
                      ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest">{t.dayLabel} {guide.id}</span>
                  </button>

                  {/* Secondary Action: Toggle Done */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleAudio(guide.id); }}
                    className={`absolute -top-2 -right-2 w-8 h-8 rounded-full shadow-lg transition-all active:scale-90 z-20 flex items-center justify-center border-2 ${guide.isCompleted ? 'bg-[#B8860B] border-[#FCF6BA]/50 text-white' : 'bg-[#051a12] border-white/40 text-white/70 hover:text-white hover:border-white/60'}`}
                    title={guide.isCompleted ? "Mark as Unfinished" : "Mark as Done"}
                    aria-label={guide.isCompleted ? "Mark as Unfinished" : "Mark as Done"}
                  >
                    {guide.isCompleted ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    ) : (
                      <span className="text-[10px] font-bold">{guide.id}</span>
                    )}
                  </button>

                  {/* Custom Tooltip for Filename */}
                  {(guide.fileName || guide.date) && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-teal-900 text-white text-[10px] px-3 py-2 rounded-xl z-50 whitespace-normal min-w-[150px] max-w-[250px] text-center shadow-2xl pointer-events-none animate-fade-in border border-white/10">
                      {guide.fileName && <div className="font-bold mb-1">{guide.fileName}</div>}
                      {guide.date && <div className="opacity-60 mb-1">{guide.date}</div>}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-teal-900"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Patron Information Section */}
      <section className="mb-12 fade-content">
        <div className="glass-card rounded-[2rem] p-8 border-l-4 border-[#D4AF37] shadow-2xl flex flex-col items-center text-center space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 rounded-full -mr-12 -mt-12"></div>
          <div className="space-y-2 relative z-10">
            <h2 className="text-[10px] font-bold gold-text uppercase tracking-[0.2em]">Our Spiritual Patron</h2>
            <p className={`text-white font-serif italic leading-relaxed md:text-lg ${lang === 'my' ? 'text-base' : 'text-sm'}`}>
              {t.patronInfo}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 relative z-10">
            <a 
              href={PATRON_WEBSITE_URL} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#B8860B] text-white rounded-2xl text-xs font-bold shadow-lg hover:bg-[#9a700a] transition-all active-scale border border-[#FCF6BA]/30"
            >
              {t.visitWebsite}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
            </a>
            <a 
              href={AUDIO_SUMMARY_URL} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 text-white/80 rounded-2xl text-xs font-bold shadow-lg hover:bg-white/10 transition-all active-scale border border-white/10"
            >
              {t.audioSummary}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </a>
            <a 
              href={NOTEBOOK_LM_URL} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 text-white/80 rounded-2xl text-xs font-bold shadow-lg hover:bg-white/10 transition-all active-scale border border-white/10"
            >
              {t.notebookLM}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.989-2.386l-.548-.547z" /></svg>
            </a>
          </div>
        </div>
      </section>

      {successMessage && <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-teal-900 text-white px-6 py-4 rounded-2xl shadow-2xl z-[200] animate-fade-in font-bold text-xs" role="status">{successMessage}</div>}

      {/* Explanation Modal */}
      {selectedAudio && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-lg rounded-[2.5rem] p-8 border-2 border-[#D4AF37]/40 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full -mr-16 -mt-16" aria-hidden="true"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold gold-text mb-1">{t.dayLabel} {selectedAudio.id}</h3>
                  {selectedAudio.date && <p className="text-teal-100/40 text-xs font-bold uppercase tracking-widest">{selectedAudio.date}</p>}
                </div>
                <button 
                  onClick={() => setSelectedAudio(null)}
                  className="p-2 text-white/40 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>

              <div className="mb-8">
                <h4 className="text-xs font-bold gold-text uppercase tracking-widest mb-3 opacity-60">{t.explanation}</h4>
                <div className={`text-white/90 leading-relaxed max-h-[300px] overflow-y-auto pr-2 custom-scrollbar whitespace-pre-wrap ${lang === 'my' ? 'text-lg' : 'text-base'}`}>
                  {selectedAudio.explanation || (lang === 'my' ? "ရှင်းလင်းချက် မရှိသေးပါ။" : "No explanation available yet.")}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => listenNow(selectedAudio)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[#B8860B] text-white rounded-2xl font-bold shadow-lg hover:bg-[#9a700a] transition-all active-scale border border-[#FCF6BA]/30"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/></svg>
                  {t.listenNow}
                </button>
                <button 
                  onClick={() => setSelectedAudio(null)}
                  className="px-6 py-4 bg-white/5 text-white/60 rounded-2xl font-bold hover:bg-white/10 transition-all active-scale border border-white/10"
                >
                  {t.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* iOS Install Modal */}
      {showIosModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-sm rounded-[2.5rem] p-8 border-2 border-[#D4AF37]/40 relative overflow-hidden shadow-2xl text-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full -mr-16 -mt-16" aria-hidden="true"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-[#B8860B]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[#B8860B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold gold-text mb-4">{t.iosInstallTitle}</h3>
              <p className="text-white/80 text-sm leading-relaxed mb-8">
                {t.iosInstallDesc}
              </p>
              <button 
                onClick={() => setShowIosModal(false)}
                className="w-full py-4 bg-[#B8860B] text-white rounded-2xl font-bold shadow-lg hover:bg-[#9a700a] transition-all active-scale border border-[#FCF6BA]/30"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Android Install Modal */}
      {showAndroidModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-sm rounded-[2.5rem] p-8 border-2 border-[#D4AF37]/40 relative overflow-hidden shadow-2xl text-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full -mr-16 -mt-16" aria-hidden="true"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-[#B8860B]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[#B8860B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold gold-text mb-4">{t.iosInstallTitle}</h3>
              <p className="text-white/80 text-sm leading-relaxed mb-8">
                {t.androidInstallDesc}
              </p>
              <button 
                onClick={() => setShowAndroidModal(false)}
                className="w-full py-4 bg-[#B8860B] text-white rounded-2xl font-bold shadow-lg hover:bg-[#9a700a] transition-all active-scale border border-[#FCF6BA]/30"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-12 text-center pb-8 opacity-40 border-t border-gray-200 pt-8">
        <p className="text-[10px] tracking-[0.3em] font-bold text-teal-900/60 uppercase">Mindful Project / {new Date().getFullYear()}</p>
      </footer>
    </main>
  );
};

export default App;
