import React, { useState } from 'react';
import { User, School, MapPin, X, Check } from 'lucide-react';
import { UserProfile } from '../types';
import { saveProfile } from '../utils/storage';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onProfileUpdated: (updated: UserProfile) => void;
}

const AVATARS = [
  { id: 'boy_hero', label: 'Bintang', emoji: '🧑‍🎓' },
  { id: 'girl_hero', label: 'Aisyah', emoji: '👩‍🎓' },
  { id: 'boy_genius', label: 'Kenzo', emoji: '👦' },
  { id: 'girl_genius', label: 'Nadia', emoji: '👧' },
  { id: 'robot_math', label: 'RoboMath', emoji: '🤖' },
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onProfileUpdated,
}) => {
  const [name, setName] = useState(profile.name);
  const [school, setSchool] = useState(profile.school);
  const [city, setCity] = useState(profile.city);
  const [avatarId, setAvatarId] = useState(profile.avatarId);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...profile,
      name: name.trim() || profile.name,
      school: school.trim() || profile.school,
      city: city.trim() || profile.city,
      avatarId,
    };
    saveProfile(updated);
    onProfileUpdated(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Profil Siswa Olimpiade</h3>
              <p className="text-xs text-slate-500">Identitas siswa untuk sertifikat dan papan peringkat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Pilih Avatar Karakter</label>
            <div className="flex items-center justify-around gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              {AVATARS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setAvatarId(av.id)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${
                    avatarId === av.id
                      ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400 scale-110'
                      : 'bg-white hover:bg-slate-100 text-slate-700'
                  }`}
                  title={av.label}
                >
                  {av.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Name input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Siswa</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Ahmad Faiz"
                className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-xl focus:border-blue-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* School input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Sekolah (SD)</label>
            <div className="relative">
              <School className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="Contoh: SD Bintang Kejora"
                className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-xl focus:border-blue-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* City / Province */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Kota / Kabupaten</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Contoh: Bandung"
                className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-xl focus:border-blue-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs"
            >
              Simpan Profil
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
