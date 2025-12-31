import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayerStore } from '../store/usePlayerStore';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type MiniPlayerNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MiniPlayer = () => {
  const navigation = useNavigation<MiniPlayerNavigationProp>();
  const navReady = useNavigationState(() => true);
  const insets = useSafeAreaInsets();

  const {
    currentSong,
    isPlaying,
    play,
    pause,
  } = usePlayerStore();

  if (!currentSong || !navReady) return null;

  const getImageUrl = (): string => {
    const image =
      currentSong.image?.find(img => img.quality === '150x150') ||
      currentSong.image?.find(img => img.quality === '500x500') ||
      currentSong.image?.[0];
    return image?.link || image?.url || '';
  };

  const { width } = useWindowDimensions();
  const isWide = width >= 600;
  const imageSize = isWide ? 64 : 50;
  const playSize = isWide ? 52 : 44;

  return (
    <TouchableOpacity
      style={[styles.container, { paddingBottom: insets.bottom, paddingVertical: isWide ? 14 : 10 }]}
      onPress={() => navigation.navigate('Player')}
      activeOpacity={0.9}
    >
      <Image source={{ uri: getImageUrl() }} style={[styles.image, { width: imageSize, height: imageSize, borderRadius: Math.round(imageSize * 0.15) }]} />

      <View style={styles.infoContainer}>
        <Text style={styles.songName} numberOfLines={1}>
          {currentSong.name}
        </Text>

        <Text style={styles.artistName} numberOfLines={1}>
          {currentSong.primaryArtists ||
            currentSong.artists?.primary?.map(a => a.name).join(', ') ||
            'Unknown Artist'}
        </Text>
      </View>

      <TouchableOpacity
        onPress={isPlaying ? pause : play}
        style={[styles.playButton, { width: playSize, height: playSize, borderRadius: Math.round(playSize / 2) }]}
      >
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={isWide ? 28 : 24}
          color="#FFFFFF"
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#2C2C2E',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  songName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  artistName: {
    fontSize: 14,
    color: '#8E8E93',
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});

export default MiniPlayer;
