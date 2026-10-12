import { DailyReminderConfig } from '../types';
import { getStoredReminder, saveReminderConfig } from './storage';

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    const config = getStoredReminder();
    config.hasPermission = permission === 'granted';
    saveReminderConfig(config);
    return permission === 'granted';
  } catch (e) {
    return false;
  }
}

export function playFriendlyChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play warm major chord chime (C5 - E5 - G5)
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
      
      gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + idx * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.1 + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.1);
      osc.stop(ctx.currentTime + idx * 0.1 + 0.6);
    });
  } catch (e) {
    // Ignore audio context auto-play restrictions
  }
}

export function triggerStudyNotification(title?: string, body?: string): boolean {
  const defaultTitle = '🌟 Waktunya Asah Otak Matematika!';
  const defaultBody = 'Halo Juara! Soal tantangan Olimpiade Matematika hari ini sudah siap. Yuk latih logikamu selama 10 menit!';

  playFriendlyChime();

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title || defaultTitle, {
        body: body || defaultBody,
        icon: '/icon.svg',
        badge: '/icon.svg',
        tag: 'daily-math-reminder',
      });
      return true;
    } catch (e) {
      console.warn('System notification failed, fallback to in-app toast', e);
    }
  }

  return false;
}

export function checkAndTriggerDailyReminder(
  onInAppAlert?: (title: string, body: string) => void
): void {
  const config = getStoredReminder();
  if (!config.enabled) return;

  const todayStr = new Date().toISOString().split('T')[0];
  if (config.lastNotifiedDate === todayStr) {
    // Already notified today
    return;
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [targetH, targetM] = config.time.split(':').map(Number);
  const targetMinutes = (targetH || 16) * 60 + (targetM || 0);

  // If time has passed today
  if (currentMinutes >= targetMinutes) {
    const success = triggerStudyNotification();
    config.lastNotifiedDate = todayStr;
    saveReminderConfig(config);

    if (!success && onInAppAlert) {
      onInAppAlert(
        '🔔 Waktunya Belajar Matematika!',
        'Jadwal belajarmu pukul ' + config.time + ' sudah tiba. Ayo selesaikan tantangan hari ini!'
      );
    }
  }
}
