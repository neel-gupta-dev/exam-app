'use client';

export default function ProtocolRetry() {
  return (
    <button 
      onClick={() => window.location.reload()}
      className="px-8 py-3.5 bg-white/5 text-white border border-white/10 font-headline font-bold rounded-xl active:scale-95 transition-all hover:bg-white/10 w-full"
    >
      Re-Synchronize Vault
    </button>
  );
}
