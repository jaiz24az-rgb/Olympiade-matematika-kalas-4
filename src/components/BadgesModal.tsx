import React from 'react';
import { Trophy, Star, Flame, Zap, Calculator, Shapes, PieChart, Brain, Clock, Footprints, X, CheckCircle2 } from 'lucide-react';
import { Badge, UserProfile } from '../types';
import { calculateLevelFromXP } from '../utils/storage';

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  badges: Badge[];
  profile: UserProfile;
}

export const BadgesModal: React.FC<BadgesModalProps> = ({
  isOpen,
  onClose,
  badges,
  profile,
}) => {
  if (!isOpen) return null;

  const currentLevel = calculateLevelFromXP(profile.xp);
  const nextXp = currentLevel.maxXp;
  const currentTierXp = profile.xp - currentLevel.minXp;
  const rangeTierXp = Math.max(1, currentLevel.maxXp - currentLevel.minXp);
  const progressPercent = Math.min(100, Math.round((currentTierXp / rangeTierXp) * 100));

  const renderIcon = (name: string, unlocked: boolean) => {
    const iconClass = `w-5 h-5 ${unlocked ? 'text-amber-500' : 'text-slate-400'}`;
    switch (name) {
      case 'Footprints': return <Footprints className={iconClass} />;
      case 'Flame': return <Flame className={iconClass} />;
      case 'Zap': return <Zap className={iconClass} />;
      case 'Calculator': return <Calculator className={iconClass} />;
      case 'Shapes': return <Shapes className={iconClass} />;
      case 'PieChart': return <PieChart className={iconClass} />;
      case 'Brain': return <Brain className={iconClass} />;
      case 'Trophy': return <Trophy className={iconClass} />;
      case 'Clock': return <Clock className={iconClass} />;
      default: return <Star className={iconClass} />;
    }
  };

  const unlockedCount = badges.filter((b) => !!b.unlockedAt).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Koleksi Lencana & Pencapaian</h3>
              <p className="text-xs text-slate-500">
                {unlockedCount} dari {badges.length} lencana telah terbuka
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level Progression Card */}
        <div className="my-4 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <div>
              <span className="text-[11px] font-bold text-blue-700 tracking-wider">LEVEL {currentLevel.level}</span>
              <h4 className="text-sm font-extrabold text-slate-900">{currentLevel.title}</h4>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-blue-800">{profile.xp} XP</span>
              <p className="text-[11px] text-slate-500">Target Level Berikutnya: {nextXp} XP</p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full h-2.5 bg-blue-200/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Badges Grid Scrollable */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {badges.map((badge) => {
            const isUnlocked = !!badge.unlockedAt;
            const progress = badge.progress || 0;
            const max = badge.maxProgress;

            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-xl border transition-all flex items-start gap-3.5 ${
                  isUnlocked
                    ? 'bg-amber-50/50 border-amber-200/80 shadow-xs'
                    : 'bg-white border-slate-200 opacity-80'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    isUnlocked ? 'bg-amber-100 ring-2 ring-amber-300' : 'bg-slate-100'
                  }`}
                >
                  {renderIcon(badge.icon, isUnlocked)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h5
                      className={`text-xs font-bold truncate ${
                        isUnlocked ? 'text-slate-900' : 'text-slate-600'
                      }`}
                    >
                      {badge.title}
                    </h5>
                    {isUnlocked ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Terbuka
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-400 shrink-0">
                        {progress} / {max}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{badge.description}</p>

                  {!isUnlocked && max > 1 && (
                    <div className="mt-2 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-400 rounded-full"
                        style={{ width: `${Math.min(100, (progress / max) * 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 shrink-0 mt-3">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
