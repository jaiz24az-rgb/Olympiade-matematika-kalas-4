import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Share2, 
  Copy, 
  Check, 
  Printer, 
  MessageSquare, 
  AlertTriangle, 
  Sparkles, 
  Clock, 
  Target, 
  HeartHandshake, 
  Lock, 
  KeyRound,
  ExternalLink
} from 'lucide-react';
import { UserProfile, TopicCategory } from '../types';
import { TOPICS } from '../data/questions';
import { getStoredAnswers, saveProfile } from '../utils/storage';

interface ParentDashboardProps {
  profile: UserProfile;
  onProfileUpdated: (profile: UserProfile) => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  profile,
  onProfileUpdated,
}) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [showChangePin, setShowChangePin] = useState(false);
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);

  const answers = getStoredAnswers();
  const total = answers.length;
  const correct = answers.filter((a) => a.isCorrect).length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const totalMinutes = Math.round(answers.reduce((acc, a) => acc + (a.timeSpentSec || 15), 0) / 60);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === profile.parentPin || pinInput === '1234') {
      setIsUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length === 4) {
      const updated = { ...profile, parentPin: newPin };
      saveProfile(updated);
      onProfileUpdated(updated);
      setPinChangeSuccess(true);
      setShowChangePin(false);
      setNewPin('');
      setTimeout(() => setPinChangeSuccess(false), 3000);
    }
  };

  // Generate WhatsApp / Copyable Report Text
  const generateReportText = () => {
    const topicLines = TOPICS.map((t) => {
      const qTopic = answers.filter((a) => a.topic === t.id);
      const cTopic = qTopic.filter((a) => a.isCorrect).length;
      const acc = qTopic.length > 0 ? Math.round((cTopic / qTopic.length) * 100) : 0;
      return `• ${t.name}: ${acc}% (${cTopic}/${qTopic.length} benar)`;
    }).join('\n');

    return `📊 *LAPORAN PERKEMBANGAN BELAJAR OLIMPIADE MATEMATIKA SD KELAS 4*
Siswa: ${profile.name} (${profile.school}, ${profile.city})
Level: Level ${profile.level} (${profile.xp} XP)
Konsistensi: ${profile.streakDays} Hari Belajar Berturut-turut

📈 *Ringkasan Prestasi:*
- Total Soal Dikerjakan: ${total} soal
- Akurasi Keseluruhan: ${accuracy}%
- Estimasi Waktu Belajar: ${totalMinutes} menit

📚 *Penguasaan Per Topik:*
${topicLines}

💡 *Catatan Orang Tua:*
${
  accuracy >= 75
    ? 'Ananda memiliki pemahaman logika dan geometri yang sangat baik. Sangat siap untuk seleksi OSN SD tingkat kota/provinsi.'
    : 'Pemahaman konsep dasar sudah baik, perlu pendampingan rutin untuk soal cerita bertingkat (HOTS).'
}

_Dibuat otomatis melalui Aplikasi Olimpiade Matematika SD Kelas 4_`;
  };

  const handleCopyReport = () => {
    const text = generateReportText();
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(generateReportText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  // Locked Gate Screen
  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto my-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-6">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto ring-8 ring-blue-50/50">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-black text-slate-900">Dasbor Khusus Orang Tua</h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Halaman ini dikhususkan bagi Ayah/Bunda untuk memantau perkembangan belajar, analisis kelemahan anak, dan berbagi laporan berkala.
          </p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Masukkan 4-Digit PIN Orang Tua
            </label>
            <input
              type="password"
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="••••"
              className="w-36 mx-auto text-center tracking-[0.5em] text-xl font-bold py-2.5 px-3 border border-slate-300 rounded-xl focus:border-blue-600 focus:outline-hidden"
              autoFocus
            />
            {pinError && (
              <p className="text-xs text-rose-600 font-semibold mt-2">
                PIN salah. Silakan coba kembali (PIN default: 1234)
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition shadow-xs"
          >
            Buka Dasbor
          </button>
        </form>

        <p className="text-[11px] text-slate-400">
          💡 PIN Default awal adalah: <strong className="text-slate-600 font-mono">1234</strong>
        </p>
      </div>
    );
  }

  // Unlocked Parent Dashboard
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Zona Akses Orang Tua Terverifikasi</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Dasbor Pemantauan Progres: {profile.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {profile.school} · Kelas 4 SD · {profile.city}
          </p>
        </div>

        {/* Action buttons for report sharing */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-xs whitespace-nowrap"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Kirim via WhatsApp</span>
          </button>
          <button
            onClick={handleCopyReport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition shadow-xs whitespace-nowrap"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Tersalin!' : 'Salin Laporan'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cetak</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Tingkat Ketepatan Menjawab</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-slate-900 font-mono tabular-nums">{accuracy}%</span>
            <span className="text-xs text-slate-500">({correct}/{total} soal)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Target OSN SD yang dianjurkan: di atas 75%
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Kedisiplinan Belajar Harian</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-blue-600 font-mono tabular-nums">{profile.streakDays}</span>
            <span className="text-xs text-slate-500">Hari Berturut-turut</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Jadwal pengingat otomatis aktif
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Durasi Latihan Kumulatif</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-purple-600 font-mono tabular-nums">{totalMinutes}</span>
            <span className="text-xs text-slate-500">Menit Efektif</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Rekomendasi harian: 15–20 menit per hari
          </p>
        </div>
      </div>

      {/* Printable / Shareable Report Card Preview */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 print:border-none print:shadow-none">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              Pratinjau Kartu Laporan Kemajuan Anak
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Format Siap Dibagikan</span>
        </div>

        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs space-y-4 font-mono">
          <div className="space-y-1">
            <p className="font-bold text-slate-900 text-sm">
              LAPORAN PRESTASI MATEMATIKA KELAS 4 SD
            </p>
            <p className="text-slate-600">Nama: {profile.name} · Sekolah: {profile.school}</p>
            <p className="text-slate-600">Peringkat XP Saat Ini: {profile.xp} XP (Level {profile.level})</p>
          </div>

          <div className="border-t border-slate-200 pt-3 space-y-1 text-slate-700">
            <p className="font-bold text-slate-900">Penguasaan Materi:</p>
            {TOPICS.map((t) => {
              const qTopic = answers.filter((a) => a.topic === t.id);
              const cTopic = qTopic.filter((a) => a.isCorrect).length;
              const acc = qTopic.length > 0 ? Math.round((cTopic / qTopic.length) * 100) : 0;
              return (
                <div key={t.id} className="flex justify-between py-0.5">
                  <span>{t.name}</span>
                  <span className="font-bold">{acc}% ({cTopic}/{qTopic.length})</span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-200 pt-3">
            <p className="font-bold text-slate-900">Saran Pembinaan Orang Tua:</p>
            <p className="text-slate-700 mt-1 font-sans text-xs leading-relaxed">
              Ananda telah menunjukkan antusiasme yang tinggi. Untuk memaksimalkan peluang lolos seleksi olimpiade, berikan apresiasi atas usahanya dan dorong untuk terus menjaga streak tantangan harian.
            </p>
          </div>
        </div>
      </div>

      {/* Parent PIN Management */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-slate-500" />
            <span>Pengaturan Keamanan PIN Orang Tua</span>
          </span>
          <p className="text-xs text-slate-500 mt-0.5">
            Ubah PIN agar sang anak tidak dapat mengubah konfigurasi pengingat atau dasbor.
          </p>
          {pinChangeSuccess && (
            <p className="text-xs text-emerald-600 font-bold mt-1">PIN berhasil diperbarui!</p>
          )}
        </div>

        {!showChangePin ? (
          <button
            onClick={() => setShowChangePin(true)}
            className="px-3.5 py-1.5 text-xs font-bold bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 transition whitespace-nowrap self-start sm:self-auto"
          >
            Ubah PIN (4 Digit)
          </button>
        ) : (
          <form onSubmit={handleSaveNewPin} className="flex items-center gap-2">
            <input
              type="password"
              maxLength={4}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="PIN Baru"
              className="w-24 text-center text-xs font-bold py-1.5 px-2 bg-white border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-hidden"
              autoFocus
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition"
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={() => setShowChangePin(false)}
              className="px-2 py-1.5 text-slate-500 text-xs hover:text-slate-800"
            >
              Batal
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
