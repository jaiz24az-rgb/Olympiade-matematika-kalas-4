import React, { useState } from 'react';
import { Trophy, Medal, Flame, Star, Award, Search, Globe, Shield } from 'lucide-react';
import { UserProfile, LeaderboardUser } from '../types';
import { INITIAL_LEADERBOARD } from '../data/leaderboard';

interface LeaderboardViewProps {
  profile: UserProfile;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ profile }) => {
  const [timeframe, setTimeframe] = useState<'mingguan' | 'bulanan' | 'all'>('mingguan');
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamically insert or place current student into the leaderboard based on XP
  const currentUserEntry: LeaderboardUser = {
    id: 'current-student',
    name: profile.name,
    school: profile.school,
    city: profile.city,
    score: Math.round(profile.xp * 0.7),
    xp: profile.xp,
    avatarId: profile.avatarId,
    badgeCount: 4,
    streak: profile.streakDays,
    rank: 0,
    isCurrent: true,
  };

  // Combine and sort by score/xp
  const allEntries: LeaderboardUser[] = [...INITIAL_LEADERBOARD, currentUserEntry]
    .sort((a, b) => b.xp - a.xp)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  const currentStudentRank = allEntries.find((e) => e.isCurrent)?.rank || 1;

  const filteredEntries = allEntries.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.school.toLowerCase().includes(q) ||
      item.city.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Globe className="w-4 h-4" />
            <span>Kompetisi Matematika Nasional SD Kelas 4</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Peringkat Siswa Berprestasi
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Peringkat diperbarui secara otomatis berdasarkan akumulasi latihan terverifikasi di seluruh Indonesia.
          </p>
        </div>

        {/* Current Student Placement Pill Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-4 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-xs">
            #{currentStudentRank}
          </div>
          <div>
            <span className="text-[11px] font-bold text-blue-700 uppercase">Posisi Peringkat Kamu</span>
            <p className="text-sm font-extrabold text-slate-900">{profile.name}</p>
            <p className="text-xs text-slate-500 font-mono tabular-nums">{profile.xp} XP · {profile.streakDays} Hari Streak</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Timeframe tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit">
          <button
            onClick={() => setTimeframe('mingguan')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              timeframe === 'mingguan' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Minggu Ini
          </button>
          <button
            onClick={() => setTimeframe('bulanan')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              timeframe === 'bulanan' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bulan Ini
          </button>
          <button
            onClick={() => setTimeframe('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              timeframe === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sepanjang Waktu
          </button>
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, sekolah, kota..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 text-slate-800"
          />
        </div>
      </div>

      {/* Leaderboard Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-16 text-center">Peringkat</th>
                <th className="py-3 px-4">Nama Siswa & Sekolah</th>
                <th className="py-3 px-4">Wilayah / Kota</th>
                <th className="py-3 px-4 text-center">Streak</th>
                <th className="py-3 px-4 text-right">Total XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEntries.map((user) => {
                const isCurrent = !!user.isCurrent;
                const isTop1 = user.rank === 1;
                const isTop2 = user.rank === 2;
                const isTop3 = user.rank === 3;

                return (
                  <tr
                    key={user.id}
                    className={`transition-colors ${
                      isCurrent
                        ? 'bg-blue-50/70 font-semibold'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Rank column */}
                    <td className="py-3.5 px-4 text-center">
                      {isTop1 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-700 font-black text-xs ring-2 ring-amber-300">
                          🥇 1
                        </span>
                      ) : isTop2 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-black text-xs">
                          🥈 2
                        </span>
                      ) : isTop3 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-50 text-amber-900 font-black text-xs">
                          🥉 3
                        </span>
                      ) : (
                        <span className="font-mono font-bold text-slate-500 tabular-nums">
                          #{user.rank}
                        </span>
                      )}
                    </td>

                    {/* Student Name & School */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 ${
                            isCurrent
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-slate-900 ${isCurrent ? 'font-black text-blue-900' : 'font-bold'}`}>
                              {user.name}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded-md font-bold">
                                Kamu
                              </span>
                            )}
                          </div>
                          <span className="text-slate-500 text-[11px] block">{user.school}</span>
                        </div>
                      </div>
                    </td>

                    {/* City */}
                    <td className="py-3.5 px-4 text-slate-600">
                      {user.city}
                    </td>

                    {/* Streak */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-slate-700 tabular-nums">
                        <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                        {user.streak}h
                      </span>
                    </td>

                    {/* Total XP */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono font-extrabold text-blue-700 tabular-nums text-sm">
                        {user.xp} XP
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rules Footer Callout */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold text-slate-800">Aturan Penilaian Olimpiade Nasional:</span> Poin dihitung dari hasil pengerjaan mandiri tanpa kecurangan. Tingkat Olimpiade bernilai 35 poin, Tingkat Sedang bernilai 20 poin, Tingkat Mudah 10 poin, dan menyelesaikan Tantangan Harian memberikan bonus 50 XP!
        </div>
      </div>
    </div>
  );
};
