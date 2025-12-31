import { create } from 'zustand';
import { Song, PlaybackState, RepeatMode } from '../types';
import { Audio } from 'expo-av';
import { storageService } from '../utils/storage';

interface PlayerStore extends PlaybackState {
  currentSong: Song | null;
  queue: Song[];
  currentIndex: number;
  repeatMode: RepeatMode;
  shuffleMode: boolean;
  sound: Audio.Sound | null;
  
  // Actions
  setCurrentSong: (song: Song | null) => void;
  setQueue: (songs: Song[]) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  setCurrentIndex: (index: number) => void;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  initialize: () => Promise<void>;
  updatePlaybackState: (state: Partial<PlaybackState>) => void;
}

const getNextIndex = (currentIndex: number, queueLength: number, repeatMode: RepeatMode, shuffleMode: boolean): number => {
  if (repeatMode === 'one') {
    return currentIndex;
  }
  
  if (shuffleMode) {
    return Math.floor(Math.random() * queueLength);
  }
  
  if (currentIndex < queueLength - 1) {
    return currentIndex + 1;
  }
  
  if (repeatMode === 'all') {
    return 0;
  }
  
  return currentIndex;
};

const getPreviousIndex = (currentIndex: number, queueLength: number, repeatMode: RepeatMode, shuffleMode: boolean): number => {
  if (repeatMode === 'one') {
    return currentIndex;
  }
  
  if (shuffleMode) {
    return Math.floor(Math.random() * queueLength);
  }
  
  if (currentIndex > 0) {
    return currentIndex - 1;
  }
  
  if (repeatMode === 'all') {
    return queueLength - 1;
  }
  
  return currentIndex;
};

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentSong: null,
  queue: [],
  currentIndex: -1,
  repeatMode: 'none',
  shuffleMode: false,
  sound: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  isLoading: false,
  error: null,

  initialize: async () => {
    try {
      const savedQueue = storageService.getQueue();
      const savedSong = storageService.getCurrentSong();
      const savedRepeatMode = storageService.getRepeatMode();
      const savedShuffleMode = storageService.getShuffleMode();

      set({
        queue: savedQueue || [],
        currentSong: savedSong,
        repeatMode: savedRepeatMode || 'none',
        shuffleMode: savedShuffleMode || false,
      });

      if (savedSong && savedQueue && savedQueue.length > 0) {
        const index = savedQueue.findIndex(s => s.id === savedSong.id);
        if (index !== -1) {
          set({ currentIndex: index });
        }
      }
    } catch (error) {
      console.error('Error initializing store:', error);
      // Set defaults on error
      set({
        queue: [],
        currentSong: null,
        currentIndex: -1,
        repeatMode: 'none',
        shuffleMode: false,
      });
    }
  },

  setCurrentSong: (song) => {
    set({ currentSong: song });
    storageService.saveCurrentSong(song);
  },

  setQueue: (songs) => {
    set({ queue: songs });
    storageService.saveQueue(songs);
  },

  addToQueue: (song) => {
    const { queue } = get();
    const newQueue = [...queue, song];
    set({ queue: newQueue });
    storageService.saveQueue(newQueue);
  },

  removeFromQueue: (index) => {
    const { queue, currentIndex } = get();
    const newQueue = queue.filter((_, i) => i !== index);
    let newCurrentIndex = currentIndex;
    
    if (index < currentIndex) {
      newCurrentIndex = currentIndex - 1;
    } else if (index === currentIndex && newQueue.length > 0) {
      newCurrentIndex = Math.min(currentIndex, newQueue.length - 1);
    } else if (newQueue.length === 0) {
      newCurrentIndex = -1;
    }
    
    set({ queue: newQueue, currentIndex: newCurrentIndex });
    storageService.saveQueue(newQueue);
  },

  reorderQueue: (fromIndex, toIndex) => {
    const { queue, currentIndex } = get();
    const newQueue = [...queue];
    const [removed] = newQueue.splice(fromIndex, 1);
    newQueue.splice(toIndex, 0, removed);
    
    let newCurrentIndex = currentIndex;
    if (currentIndex === fromIndex) {
      newCurrentIndex = toIndex;
    } else if (currentIndex > fromIndex && currentIndex <= toIndex) {
      newCurrentIndex = currentIndex - 1;
    } else if (currentIndex < fromIndex && currentIndex >= toIndex) {
      newCurrentIndex = currentIndex + 1;
    }
    
    set({ queue: newQueue, currentIndex: newCurrentIndex });
    storageService.saveQueue(newQueue);
  },

  setCurrentIndex: (index) => {
    set({ currentIndex: index });
  },

  updatePlaybackState: (state) => {
    set(state);
  },

  play: async () => {
    const { currentSong, sound, queue, currentIndex } = get();
    
    if (!currentSong && queue.length > 0 && currentIndex >= 0) {
      const song = queue[currentIndex];
      get().setCurrentSong(song);
      await get().play();
      return;
    }

    if (!currentSong) {
      return;
    }

    try {
      set({ isLoading: true, error: null });

      let audioSound = sound;
      
      if (!audioSound) {
        // Get the best quality download URL
        const downloadUrl = currentSong.downloadUrl?.find(d => d.quality === '320kbps') 
          || currentSong.downloadUrl?.find(d => d.quality === '160kbps')
          || currentSong.downloadUrl?.find(d => d.quality === '96kbps')
          || currentSong.downloadUrl?.[0];

        if (!downloadUrl) {
          throw new Error('No download URL available');
        }

        const url = downloadUrl.link || downloadUrl.url;
        if (!url) {
          throw new Error('No download URL available');
        }
        
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: url },
          { shouldPlay: true },
          (status) => {
            if (status.isLoaded) {
              get().updatePlaybackState({
                currentTime: status.positionMillis / 1000,
                duration: status.durationMillis ? status.durationMillis / 1000 : 0,
                isPlaying: status.isPlaying,
                isLoading: status.isBuffering,
              });
            }
          }
        );

        audioSound = newSound;
        set({ sound: audioSound });
      } else {
        await audioSound.playAsync();
      }

      set({ isPlaying: true, isLoading: false });
    } catch (error: any) {
      console.error('Error playing song:', error);
      set({ error: error.message || 'Failed to play song', isLoading: false });
    }
  },

  pause: async () => {
    const { sound } = get();
    if (sound) {
      await sound.pauseAsync();
      set({ isPlaying: false });
    }
  },

  stop: async () => {
    const { sound } = get();
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      set({ sound: null, isPlaying: false, currentTime: 0 });
    }
  },

  seekTo: async (position: number) => {
    const { sound } = get();
    if (sound) {
      await sound.setPositionAsync(position * 1000);
      set({ currentTime: position });
    }
  },

  playNext: async () => {
    const { queue, currentIndex, repeatMode, shuffleMode } = get();
    
    if (queue.length === 0) {
      return;
    }

    const nextIndex = getNextIndex(currentIndex, queue.length, repeatMode, shuffleMode);
    
    if (nextIndex !== currentIndex) {
      await get().stop();
      set({ currentIndex: nextIndex });
      get().setCurrentSong(queue[nextIndex]);
      await get().play();
    } else {
      await get().seekTo(0);
      await get().play();
    }
  },

  playPrevious: async () => {
    const { queue, currentIndex, repeatMode, shuffleMode } = get();
    
    if (queue.length === 0) {
      return;
    }

    const prevIndex = getPreviousIndex(currentIndex, queue.length, repeatMode, shuffleMode);
    
    if (prevIndex !== currentIndex) {
      await get().stop();
      set({ currentIndex: prevIndex });
      get().setCurrentSong(queue[prevIndex]);
      await get().play();
    } else {
      await get().seekTo(0);
      await get().play();
    }
  },

  toggleRepeat: () => {
    const { repeatMode } = get();
    const modes: RepeatMode[] = ['none', 'all', 'one'];
    const currentModeIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentModeIndex + 1) % modes.length];
    set({ repeatMode: nextMode });
    storageService.saveRepeatMode(nextMode);
  },

  toggleShuffle: () => {
    const { shuffleMode } = get();
    const newShuffleMode = !shuffleMode;
    set({ shuffleMode: newShuffleMode });
    storageService.saveShuffleMode(newShuffleMode);
  },
}));

