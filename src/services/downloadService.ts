import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Song } from '../types';

const DOWNLOAD_DIR = `${FileSystem.documentDirectory}downloads/`;

export const downloadSong = async (song: Song): Promise<string> => {
  try {
    // Request permissions
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Media library permission not granted');
    }

    // Get the best quality download URL
    const downloadUrl = song.downloadUrl?.find(d => d.quality === '320kbps') 
      || song.downloadUrl?.find(d => d.quality === '160kbps')
      || song.downloadUrl?.find(d => d.quality === '96kbps')
      || song.downloadUrl?.[0];

    if (!downloadUrl) {
      throw new Error('No download URL available');
    }

    const url = downloadUrl.link || downloadUrl.url;
    if (!url) {
      throw new Error('No download URL available');
    }
    
    // Ensure download directory exists
    const dirInfo = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(DOWNLOAD_DIR, { intermediates: true });
    }

    // Create filename
    const fileName = `${song.id}.mp4`;
    const fileUri = `${DOWNLOAD_DIR}${fileName}`;

    // Download the file
    const downloadResult = await FileSystem.downloadAsync(url, fileUri);
    
    if (downloadResult.status !== 200) {
      throw new Error('Download failed');
    }

    // Save to media library
    const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
    
    // Optionally create an album
    const albumName = 'Lokal Music Player';
    let album = await MediaLibrary.getAlbumAsync(albumName);
    if (!album) {
      album = await MediaLibrary.createAlbumAsync(albumName, asset, false);
    } else {
      await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
    }

    return downloadResult.uri;
  } catch (error: any) {
    console.error('Download error:', error);
    throw error;
  }
};

export const getDownloadedSongs = async (): Promise<string[]> => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
    if (!dirInfo.exists) {
      return [];
    }

    const files = await FileSystem.readDirectoryAsync(DOWNLOAD_DIR);
    return files.map(file => `${DOWNLOAD_DIR}${file}`);
  } catch (error) {
    console.error('Error getting downloaded songs:', error);
    return [];
  }
};

export const isSongDownloaded = async (songId: string): Promise<boolean> => {
  try {
    const fileName = `${songId}.mp4`;
    const fileUri = `${DOWNLOAD_DIR}${fileName}`;
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    return fileInfo.exists;
  } catch (error) {
    return false;
  }
};

export const deleteDownloadedSong = async (songId: string): Promise<void> => {
  try {
    const fileName = `${songId}.mp4`;
    const fileUri = `${DOWNLOAD_DIR}${fileName}`;
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    }
  } catch (error) {
    console.error('Error deleting downloaded song:', error);
    throw error;
  }
};

