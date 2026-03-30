
import React from 'react';

interface AdminPinModalProps {
  pinInput: string;
  pinError: boolean;
  t: any;
  onPinChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const AdminPinModal: React.FC<AdminPinModalProps> = ({ 
  pinInput, 
  pinError, 
  t, 
  onPinChange, 
  onSubmit, 
  onClose 
}) => {
  return (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
    >
      <div className="glass-card w-full max-w-sm rounded-[2.5rem] p-8 border-2 border-[#D4AF37]/40 relative overflow-hidden shadow-2xl text-center">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full -mr-16 -mt-16" aria-hidden="true"></div>
        <div className="relative z-10">
          <div className="w-16 h-16 bg-[#B8860B]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#B8860B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <h3 id="admin-modal-title" className="text-xl font-bold gold-text mb-2">{t.adminPinTitle}</h3>
          <p className="text-white/60 text-xs mb-6">{t.adminPinDesc}</p>
          
          <form onSubmit={onSubmit} className="space-y-4">
            <input 
              type="password"
              value={pinInput}
              onChange={(e) => onPinChange(e.target.value)}
              placeholder={t.enterPin}
              className={`w-full bg-white/5 border ${pinError ? 'border-red-500' : 'border-white/20'} rounded-2xl px-4 py-4 text-center text-white text-xl tracking-[0.5em] focus:outline-none focus:border-[#D4AF37] transition-all`}
              autoFocus
              aria-label={t.enterPin}
              aria-invalid={pinError}
              aria-describedby={pinError ? "pin-error" : undefined}
            />
            {pinError && <p id="pin-error" className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{t.invalidPin}</p>}
            
            <div className="flex gap-3">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-4 bg-white/5 text-white/60 rounded-2xl font-bold hover:bg-white/10 transition-all active-scale border border-white/10"
              >
                {t.close}
              </button>
              <button 
                type="submit"
                className="flex-[2] py-4 bg-[#B8860B] text-white rounded-2xl font-bold shadow-lg hover:bg-[#9a700a] transition-all active-scale border border-[#FCF6BA]/30"
              >
                {t.submit}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminPinModal;
