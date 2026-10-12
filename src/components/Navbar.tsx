import React from 'react';
import { 
  Trophy, 
  Flame, 
  Bell, 
  User, 
  BarChart2, 
  Calendar, 
  ShieldCheck, 
  Sparkles,
  BookOpen,
  Swords
} from 'lucide-react';
import { UserProfile, DailyReminderConfig } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

export type ActiveTab = 'practice' | 'duel' | 'daily' | 'leaderboard' | 'analytics' | 'parent';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  profile: UserProfile;
  reminderConfig: DailyReminderConfig;
  onOpenNotifications: () => void;
  onOpenBadges: () => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  profile,
  reminderConfig,
  onOpenNotifications,
  onOpenBadges,
  onOpenProfile,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <button
          onClick={() => onSelectTab('practice')}
          className="flex items-center gap-2 text-left whitespace-nowrap shrink-0 group focus:outline-hidden"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-xs group-hover:bg-blue-700 transition-colors">
            <Trophy className="w-5 h-5 text-amber-300" />
          </div>
          <span className="text-base font-extrabold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
            Olimpiade SD 4
          </span>
        </button>

        {/* Zone 2: Navigation Links (Single line) */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-600">
          <button
            onClick={() => onSelectTab('practice')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 ${
              activeTab === 'practice'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'hover:text-slate-900'
            }`}
          >
            Arena Latihan
          </button>
          <button
            onClick={() => onSelectTab('duel')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 flex items-center gap-1 ${
              activeTab === 'duel'
                ? 'text-rose-600 border-b-2 border-rose-600'
                : 'hover:text-slate-900 text-slate-700'
            }`}
          >
            <Swords className="w-3.5 h-3.5 text-rose-500" />
            <span>Duel Real-Time</span>
          </button>
          <button
            onClick={() => onSelectTab('daily')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 ${
              activeTab === 'daily'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'hover:text-slate-900'
            }`}
          >
            Tantangan Harian
          </button>
          <button
            onClick={() => onSelectTab('leaderboard')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 ${
              activeTab === 'leaderboard'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'hover:text-slate-900'
            }`}
          >
            Peringkat Nasional
          </button>
          <button
            onClick={() => onSelectTab('analytics')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 ${
              activeTab === 'analytics'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'hover:text-slate-900'
            }`}
          >
            Perkembangan Belajar
          </button>
          <button
            onClick={() => onSelectTab('parent')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 flex items-center gap-1 ${
              activeTab === 'parent'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'hover:text-slate-900 text-slate-500'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Dasbor Orang Tua</span>
          </button>
        </nav>

        {/* Zone 3: Actions & Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Gamification Level & XP pill */}
          <button
            onClick={onOpenBadges}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition shadow-2xs whitespace-nowrap shrink-0"
            title="Lihat Lencana & XP"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-mono tabular-nums">{profile.xp} XP</span>
          </button>

          {/* Streak indicator */}
          <div
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold whitespace-nowrap shrink-0 border border-amber-200"
            title="Streak belajar berturut-turut"
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span className="font-mono tabular-nums">{profile.streakDays} Hari</span>
          </div>

          {/* Daily Reminder Alarm button */}
          <button
            onClick={onOpenNotifications}
            className={`p-2 rounded-xl border transition-colors relative ${
              reminderConfig.enabled
                ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50'
            }`}
            title="Pengaturan Pengingat Belajar Harian"
          >
            <Bell className="w-4 h-4" />
            {reminderConfig.enabled && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
            )}
          </button>

          {/* Profile Avatar button */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 p-1 pl-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition text-xs font-bold text-slate-800"
            title="Edit Profil Siswa"
          >
            <span className="hidden md:inline max-w-[100px] truncate">{profile.name}</span>
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              {profile.name.charAt(0)}
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Secondary Tab Navigation Strip */}
      <div className="lg:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 border-t border-slate-100 bg-slate-50 text-xs font-bold">
        <button
          onClick={() => onSelectTab('practice')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 ${
            activeTab === 'practice' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
          }`}
        >
          Arena Latihan
        </button>
        <button
          onClick={() => onSelectTab('duel')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 flex items-center gap-1 ${
            activeTab === 'duel' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600'
          }`}
        >
          <Swords className="w-3.5 h-3.5 text-rose-500" />
          <span>Duel 1v1</span>
        </button>
        <button
          onClick={() => onSelectTab('daily')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 ${
            activeTab === 'daily' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
          }`}
        >
          Tantangan Harian
        </button>
        <button
          onClick={() => onSelectTab('leaderboard')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 ${
            activeTab === 'leaderboard' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
          }`}
        >
          Peringkat
        </button>
        <button
          onClick={() => onSelectTab('analytics')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 ${
            activeTab === 'analytics' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
          }`}
        >
          Perkembangan
        </button>
        <button
          onClick={() => onSelectTab('parent')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 ${
            activeTab === 'parent' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
          }`}
        >
          Orang Tua
        </button>
      </div>
    </header>
  );
};

