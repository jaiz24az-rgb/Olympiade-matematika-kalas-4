import React, { useState } from 'react';
import { Bell, Clock, CheckCircle2, AlertCircle, X, Volume2 } from 'lucide-react';
import { DailyReminderConfig } from '../types';
import { getStoredReminder, saveReminderConfig } from '../utils/storage';
import { requestNotificationPermission, triggerStudyNotification } from '../utils/notifications';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (config: DailyReminderConfig) => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  onUpdated,
}) => {
  const [config, setConfig] = useState<DailyReminderConfig>(getStoredReminder());
  const [permissionState, setPermissionState] = useState<string>(
    'Notification' in window ? Notification.permission : 'unsupported'
  );
  const [testStatus, setTestStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggle = (enabled: boolean) => {
    const updated = { ...config, enabled };
    setConfig(updated);
    saveReminderConfig(updated);
    onUpdated(updated);
  };

  const handleTimeChange = (time: string) => {
    const updated = { ...config, time };
    setConfig(updated);
    saveReminderConfig(updated);
    onUpdated(updated);
  };

  const handleRequestPerm = async () => {
    const granted = await requestNotificationPermission();
    setPermissionState(granted ? 'granted' : 'denied');
    const updated = { ...config, hasPermission: granted };
    setConfig(updated);
    onUpdated(updated);
  };

  const handleTestNotification = () => {
    const sent = triggerStudyNotification(
      '🌟 Lonceng Juara Matematika Berbunyi!',
      'Halo! Pengingat otomatis belajarmu aktif. Konsistensi setiap hari adalah kunci juara OSN!'
    );
    setTestStatus(sent ? 'Notifikasi sistem terkirim!' : 'Bunyi chime berbunyi (Notifikasi sistem tidak aktif)');
    setTimeout(() => setTestStatus(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Pengingat Belajar Harian</h3>
              <p className="text-xs text-slate-500">Membangun disiplin juara matematika setiap hari</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Toggle */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <span className="text-sm font-bold text-slate-800">Aktifkan Pengingat Otomatis</span>
            <p className="text-xs text-slate-500">Kirim pemberitahuan setiap hari pada jam belajar pilihan</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => handleToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Time Selector */}
        {config.enabled && (
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">Pilih Waktu Belajar Harian</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '07:00 Pagi', val: '07:00' },
                { label: '16:00 Sore', val: '16:00' },
                { label: '19:00 Malam', val: '19:00' },
              ].map((preset) => (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => handleTimeChange(preset.val)}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                    config.time === preset.val
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs text-slate-500">Atau pilih jam khusus:</span>
              <div className="flex items-center gap-2 border border-slate-300 rounded-lg px-2.5 py-1 bg-white">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="time"
                  value={config.time}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="text-xs font-bold text-slate-800 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* Browser Permission status */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-slate-700">Izin Notifikasi Peramban:</span>
            {permissionState === 'granted' ? (
              <span className="flex items-center gap-1 font-bold text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
              </span>
            ) : (
              <span className="flex items-center gap-1 font-bold text-amber-600">
                <AlertCircle className="w-3.5 h-3.5" /> Belum Diizinkan
              </span>
            )}
          </div>

          {permissionState !== 'granted' && (
            <button
              onClick={handleRequestPerm}
              className="w-full py-1.5 px-3 bg-white border border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              Izinkan Notifikasi Sekarang
            </button>
          )}
        </div>

        {/* Test Notification Button */}
        <div className="space-y-1">
          <button
            onClick={handleTestNotification}
            className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Volume2 className="w-4 h-4 text-blue-600" />
            <span>Tes Lonceng Pengingat Sekarang</span>
          </button>
          {testStatus && (
            <p className="text-[11px] text-center text-blue-600 font-medium animate-in fade-in">
              {testStatus}
            </p>
          )}
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition"
        >
          Simpan & Tutup
        </button>
      </div>
    </div>
  );
};
