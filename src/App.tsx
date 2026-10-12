import React, { useState, useEffect } from 'react';
import { 
  Navbar, 
  ActiveTab 
} from './components/Navbar';
import { PracticeArena } from './components/PracticeArena';
import { CompetitionArena } from './components/CompetitionArena';
import { DailyChallenge } from './components/DailyChallenge';
import { LeaderboardView } from './components/LeaderboardView';
import { AnalyticsView } from './components/AnalyticsView';
import { ParentDashboard } from './components/ParentDashboard';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { BadgesModal } from './components/BadgesModal';
import { ProfileModal } from './components/ProfileModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { UserProfile, DailyReminderConfig, Badge } from './types';
import { 
  getStoredProfile, 
  saveProfile, 
  getStoredReminder, 
  getStoredBadges, 
  checkAndUpdateDailyStreak 
} from './utils/storage';
import { checkAndTriggerDailyReminder } from './utils/notifications';
import { Bell, Trophy, BookOpen, Sparkles, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('practice');
  const [profile, setProfile] = useState<UserProfile>(() => getStoredProfile());
  const [reminderConfig, setReminderConfig] = useState<DailyReminderConfig>(() => getStoredReminder());
  const [badges, setBadges] = useState<Badge[]>(() => getStoredBadges());

  // Modals state
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // In-app Notification Banner
  const [inAppAlert, setInAppAlert] = useState<{ title: string; body: string } | null>(null);

  // Initial check on streak and periodic check for daily study reminder
  useEffect(() => {
    const { updatedProfile } = checkAndUpdateDailyStreak(profile);
    setProfile(updatedProfile);

    // Initial check
    checkAndTriggerDailyReminder((title, body) => {
      setInAppAlert({ title, body });
    });

    // Check every 45 seconds for scheduled reminder
    const timer = setInterval(() => {
      checkAndTriggerDailyReminder((title, body) => {
        setInAppAlert({ title, body });
      });
    }, 45000);

    return () => clearInterval(timer);
  }, []);

  const handleProfileUpdated = (updated: UserProfile) => {
    setProfile(updated);
    setBadges(getStoredBadges());
  };

  const handleReminderUpdated = (updated: DailyReminderConfig) => {
    setReminderConfig(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        profile={profile}
        reminderConfig={reminderConfig}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        onOpenBadges={() => setIsBadgesModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* In-app scheduled reminder banner alert */}
      {inAppAlert && (
        <aside
          aria-label="Pemberitahuan Belajar"
          className="bg-blue-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs animate-in slide-in-from-top duration-200"
        >
          <div className="flex items-center gap-2 max-w-4xl mx-auto flex-1">
            <Bell className="w-4 h-4 shrink-0 text-amber-300 animate-bounce" />
            <div>
              <span className="font-extrabold mr-1.5">{inAppAlert.title}</span>
              <span className="text-blue-100">{inAppAlert.body}</span>
            </div>
          </div>
          <button
            onClick={() => setInAppAlert(null)}
            className="p-1 hover:bg-blue-700 rounded-lg text-blue-200 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </aside>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8">
        {activeTab === 'practice' && (
          <PracticeArena
            profile={profile}
            onProfileUpdated={handleProfileUpdated}
            onOpenBadges={() => setIsBadgesModalOpen(true)}
          />
        )}

        {activeTab === 'duel' && (
          <CompetitionArena
            profile={profile}
            onProfileUpdated={handleProfileUpdated}
            onOpenBadges={() => setIsBadgesModalOpen(true)}
          />
        )}

        {activeTab === 'daily' && (
          <DailyChallenge
            profile={profile}
            onProfileUpdated={handleProfileUpdated}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView
            profile={profile}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            profile={profile}
          />
        )}

        {activeTab === 'parent' && (
          <ParentDashboard
            profile={profile}
            onProfileUpdated={handleProfileUpdated}
          />
        )}
      </main>

      {/* Subtle Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-slate-700">Olimpiade Matematika SD Kelas 4</span>
            <span aria-hidden="true">·</span>
            <span>OSN, SASMO, & Kangaroo Math Simulator</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Dukungan Mode PWA Offline Aktif</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setActiveTab('parent')}
              className="hover:text-blue-600 transition-colors font-semibold"
            >
              Akses Orang Tua
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <NotificationSettingsModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        onUpdated={handleReminderUpdated}
      />

      <BadgesModal
        isOpen={isBadgesModalOpen}
        onClose={() => setIsBadgesModalOpen(false)}
        badges={badges}
        profile={profile}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onProfileUpdated={handleProfileUpdated}
      />

      {/* Offline Status Float Indicator */}
      <OfflineIndicator />
    </div>
  );
}
