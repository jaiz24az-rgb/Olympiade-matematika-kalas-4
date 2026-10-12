import React from 'react';
import { 
  BarChart3, 
  Target, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Award, 
  Zap, 
  BookOpen, 
  Brain 
} from 'lucide-react';
import { UserProfile, AnswerRecord, TopicCategory } from '../types';
import { TOPICS } from '../data/questions';
import { getStoredAnswers } from '../utils/storage';

interface AnalyticsViewProps {
  profile: UserProfile;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ profile }) => {
  const answers = getStoredAnswers();
  const total = answers.length;
  const correct = answers.filter((a) => a.isCorrect).length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const totalTimeSec = answers.reduce((acc, a) => acc + (a.timeSpentSec || 15), 0);
  const avgTimePerQuestion = total > 0 ? Math.round(totalTimeSec / total) : 0;

  // Breakdown by Topic
  const topicBreakdown = TOPICS.map((topic) => {
    const list = answers.filter((a) => a.topic === topic.id);
    const count = list.length;
    const correctCount = list.filter((a) => a.isCorrect).length;
    const topicAcc = count > 0 ? Math.round((correctCount / count) * 100) : 0;
    return {
      topic,
      count,
      correctCount,
      accuracy: topicAcc,
    };
  });

  // Breakdown by Difficulty
  const diffLevels = [
    { id: 'mudah', label: 'Mudah', color: 'bg-emerald-500' },
    { id: 'sedang', label: 'Sedang', color: 'bg-amber-500' },
    { id: 'olimpiade', label: 'Olimpiade Menantang', color: 'bg-rose-500' },
  ];
  const diffBreakdown = diffLevels.map((lvl) => {
    const list = answers.filter((a) => a.difficulty === lvl.id);
    const count = list.length;
    const correctCount = list.filter((a) => a.isCorrect).length;
    const acc = count > 0 ? Math.round((correctCount / count) * 100) : 0;
    return { ...lvl, count, correctCount, accuracy: acc };
  });

  return (
    <div className="space-y-6">
      {/* Top Headline Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Target className="w-4 h-4" />
            <span className="text-xs font-bold text-slate-500 uppercase">Akurasi Total</span>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono tabular-nums">{accuracy}%</p>
          <span className="text-[11px] text-slate-400 font-medium">{correct} dari {total} soal benar</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs font-bold text-slate-500 uppercase">Soal Terlatih</span>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono tabular-nums">{total}</p>
          <span className="text-[11px] text-slate-400 font-medium">Latihan mandiri & harian</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-bold text-slate-500 uppercase">Rata-rata Waktu</span>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono tabular-nums">{avgTimePerQuestion}s</p>
          <span className="text-[11px] text-slate-400 font-medium">Per satu soal latihan</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <Zap className="w-4 h-4" />
            <span className="text-xs font-bold text-slate-500 uppercase">Streak Belajar</span>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono tabular-nums">{profile.streakDays} Hari</p>
          <span className="text-[11px] text-emerald-600 font-bold">Konsistensi aktif</span>
        </div>
      </div>

      {/* Mastery by Topic */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Peta Penguasaan Topik Olimpiade SD
          </h3>
          <span className="text-xs text-slate-400">Standar Kurikulum OSN-SD</span>
        </div>

        <div className="space-y-4 pt-2">
          {topicBreakdown.map((item) => (
            <div key={item.topic.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800">{item.topic.name}</span>
                <span className="text-slate-500 font-mono tabular-nums">
                  {item.accuracy}% ({item.correctCount}/{item.count} benar)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${item.count > 0 ? item.accuracy : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Difficulty Breakdown & Cognitive Observation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Difficulty Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Distribusi Tingkat Kesulitan</h3>
          <div className="space-y-3 pt-1">
            {diffBreakdown.map((item) => (
              <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">{item.label}</p>
                  <p className="text-[11px] text-slate-500 font-mono">{item.count} Soal Dikerjakan</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-blue-700 font-mono tabular-nums">{item.accuracy}%</span>
                  <p className="text-[10px] text-slate-400">Akurasi</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cognitive Observation & Recommendations */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase">
            <Brain className="w-4 h-4" />
            <span>Rekomendasi Kognitif Adaptif</span>
          </div>
          <h4 className="text-base font-bold text-white">
            {accuracy >= 75
              ? 'Potensi Sangat Kuat Menuju OSN Emas'
              : accuracy >= 50
              ? 'Fondasi Bagus, Tingkatkan Soal Cerita'
              : 'Perlu Latihan Intensif Konsep Dasar'}
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {accuracy >= 75
              ? 'Siswa menunjukkan kemampuan analisis cepat pada logika bilangan dan geometri. Disarankan memperbanyak latihan deret bersusun dan kombinatorika.'
              : accuracy >= 50
              ? 'Siswa sudah menguasai penjumlahan Gauss dan persegi dasar. Tingkatkan ketelitian pada pecahan bertingkat dan soal cerita HOTS.'
              : 'Fokuskan latihan pada tingkat Mudah terlebih dahulu untuk memperkuat penguasaan FPB, KPK, dan pecahan senilai.'}
          </p>
        </div>
      </div>

      {/* Recent History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
        <h3 className="text-base font-bold text-slate-900">Riwayat Latihan Terbaru</h3>
        {answers.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">Belum ada riwayat soal yang dikerjakan.</p>
        ) : (
          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
            {answers.slice(0, 10).map((a, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  {a.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                  <div>
                    <span className="font-bold text-slate-800 capitalize">
                      {a.topic.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-2">Tingkat {a.difficulty}</span>
                  </div>
                </div>
                <div className="text-right font-mono tabular-nums text-slate-500">
                  <span>+{a.pointsEarned} XP</span>
                  <span className="text-[10px] text-slate-400 ml-2">{a.timeSpentSec}s</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
