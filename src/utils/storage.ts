import { MMKV } from 'react-native-mmkv';
import { Song } from '../types';

const storage = new MMKV({
  id: 'music-player-storage',
});

const QUEUE_KEY = 'music_queue';
const CURRENT_SONG_KEY = 'current_song';
const REPEAT_MODE_KEY = 'repeat_mode';
const SHUFFLE_MODE_KEY = 'shuffle_mode';

export const storageService = {
  // Queue management
  saveQueue: (queue: Song[]) => {
    storage.set(QUEUE_KEY, JSON.stringify(queue));
  },

  getQueue: (): Song[] => {
    const queue = storage.getString(QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  },

  // Current song
  saveCurrentSong: (song: Song | null) => {
    if (song) {
      storage.set(CURRENT_SONG_KEY, JSON.stringify(song));
    } else {
      storage.delete(CURRENT_SONG_KEY);
    }
  },

  getCurrentSong: (): Song | null => {
    const song = storage.getString(CURRENT_SONG_KEY);
    return song ? JSON.parse(song) : null;
  },

  // Repeat mode
  saveRepeatMode: (mode: 'none' | 'one' | 'all') => {
    storage.set(REPEAT_MODE_KEY, mode);
  },

  getRepeatMode: (): 'none' | 'one' | 'all' => {
    return (storage.getString(REPEAT_MODE_KEY) as 'none' | 'one' | 'all') || 'none';
  },

  // Shuffle mode
  saveShuffleMode: (enabled: boolean) => {
    storage.set(SHUFFLE_MODE_KEY, enabled);
  },

  getShuffleMode: (): boolean => {
    return storage.getBoolean(SHUFFLE_MODE_KEY) || false;
  },
};

