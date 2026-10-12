import React from 'react';
import { WifiOff, CheckCircle2 } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <aside
      aria-label="Status Koneksi"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-slate-900 text-white px-3.5 py-2 text-xs font-medium shadow-xl border border-slate-700 animate-in slide-in-from-bottom duration-200"
    >
      <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
      <div>
        <p className="font-semibold text-white">Mode Offline Aktif</p>
        <p className="text-[11px] text-slate-300">Semua latihan & catatan tersimpan di memori perangkat.</p>
      </div>
    </aside>
  );
};
