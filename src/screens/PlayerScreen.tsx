import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  ImageBackground,
  useWindowDimensions,
} from 'react-native';
import { usePlayerStore } from '../store/usePlayerStore';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { downloadSong, isSongDownloaded, deleteDownloadedSong } from '../services/downloadService';

const PlayerScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [sliderValue, setSliderValue] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    isLoading,
    error,
    repeatMode,
    shuffleMode,
    play,
    pause,
    seekTo,
    playNext,
    playPrevious,
    toggleRepeat,
    toggleShuffle,
  } = usePlayerStore();

  useEffect(() => {
    if (!isDragging && duration > 0) {
      setSliderValue(currentTime);
    }
  }, [currentTime, duration, isDragging]);

  useEffect(() => {
    const checkDownloadStatus = async () => {
      if (currentSong) {
        const downloaded = await isSongDownloaded(currentSong.id);
        setIsDownloaded(downloaded);
      }
    };
    checkDownloadStatus();
  }, [currentSong]);

  const handleSliderChange = (value: number) => {
    setSliderValue(value);
  };

  const handleSliderComplete = async (value: number) => {
    setIsDragging(false);
    await seekTo(value);
  };

  const handleSliderStart = () => {
    setIsDragging(true);
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getImageUrl = (): string => {
    if (!currentSong) return '';
    const image = currentSong.image?.find(img => img.quality === '500x500') 
      || currentSong.image?.find(img => img.quality === '150x150')
      || currentSong.image?.[0];
    return image?.link || image?.url || '';
  };

  const { width } = useWindowDimensions();
  const artMax = Math.min(600, Math.floor(width * 0.8));
  const artSize = Math.max(220, artMax);

  const handleMenuPress = () => {
    if (!currentSong) return;

    const options = isDownloaded
      ? ['Remove Download', 'Cancel']
      : ['Download', 'Cancel'];

    Alert.alert(
      currentSong.name,
      'Choose an option',
      [
        {
          text: options[0],
          onPress: isDownloaded ? handleRemoveDownload : handleDownload,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const handleDownload = async () => {
    if (!currentSong || isDownloading) return;

    setIsDownloading(true);
    try {
      await downloadSong(currentSong);
      setIsDownloaded(true);
      Alert.alert('Success', 'Song downloaded successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to download song');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRemoveDownload = async () => {
    if (!currentSong) return;

    try {
      await deleteDownloadedSong(currentSong.id);
      setIsDownloaded(false);
      Alert.alert('Success', 'Download removed');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to remove download');
    }
  };

  if (!currentSong) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.noSongText}>No song selected</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="chevron-down" size={32} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Now Playing</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {currentSong.primaryArtists || currentSong.artists?.primary?.map(a => a.name).join(', ') || 'Unknown Artist'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleMenuPress}
        >
          <Ionicons name="ellipsis-horizontal" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Album Art */}
      <View style={[styles.albumArtContainer, { paddingHorizontal: Math.max(16, (width - artSize) / 4) }]}>
        <Image
          source={{ uri: getImageUrl() }}
          style={[styles.albumArt, { width: artSize, height: artSize, borderRadius: Math.min(32, Math.round(artSize * 0.04)) }]}
          resizeMode="cover"
        />
      </View>

      {/* Song Info */}
      <View style={styles.songInfoContainer}>
        <Text style={styles.songName} numberOfLines={2}>
          {currentSong.name}
        </Text>
        <Text style={styles.songArtist} numberOfLines={1}>
          {currentSong.primaryArtists || currentSong.artists?.primary?.map(a => a.name).join(', ') || 'Unknown Artist'}
        </Text>
        <Text style={styles.songAlbum}>{currentSong.album.name}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration || 1}
          value={sliderValue}
          onValueChange={handleSliderChange}
          onSlidingStart={handleSliderStart}
          onSlidingComplete={handleSliderComplete}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
          thumbTintColor="#FFFFFF"
        />
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          onPress={toggleShuffle}
          style={styles.controlButton}
        >
          <Ionicons
            name={shuffleMode ? "shuffle" : "shuffle-outline"}
            size={24}
            color={shuffleMode ? "#007AFF" : "#FFFFFF"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={playPrevious}
          style={styles.controlButton}
        >
          <Ionicons name="play-skip-back" size={32} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={isPlaying ? pause : play}
          style={styles.playButton}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="large" color="#000000" />
          ) : (
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={48}
              color="#000000"
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={playNext}
          style={styles.controlButton}
        >
          <Ionicons name="play-skip-forward" size={32} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={toggleRepeat}
          style={styles.controlButton}
        >
          <Ionicons
            name={
              repeatMode === 'one'
                ? "repeat"
                : repeatMode === 'all'
                ? "repeat"
                : "repeat-outline"
            }
            size={24}
            color={repeatMode !== 'none' ? "#007AFF" : "#FFFFFF"}
          />
          {repeatMode === 'one' && (
            <View style={styles.repeatIndicator}>
              <Text style={styles.repeatText}>1</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noSongText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerSubtitle: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 2,
  },
  albumArtContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  albumArt: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: '#2C2C2E',
  },
  songInfoContainer: {
    paddingHorizontal: 32,
    paddingVertical: 24,
    alignItems: 'center',
  },
  songName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  songArtist: {
    color: '#8E8E93',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4,
  },
  songAlbum: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
  },
  progressContainer: {
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    color: '#8E8E93',
    fontSize: 12,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  controlButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  repeatIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  repeatText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#FF3B30',
    marginHorizontal: 32,
    marginBottom: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default PlayerScreen;

