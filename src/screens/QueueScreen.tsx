import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  SafeAreaView,
} from 'react-native';
import { usePlayerStore } from '../store/usePlayerStore';
import { Song } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';

type QueueScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const QueueScreen = () => {
  const navigation = useNavigation<QueueScreenNavigationProp>();
  const {
    queue,
    currentSong,
    currentIndex,
    setQueue,
    setCurrentIndex,
    setCurrentSong,
    removeFromQueue,
    reorderQueue,
    play,
  } = usePlayerStore();

  const handlePlaySong = async (song: Song, index: number) => {
    setCurrentIndex(index);
    setCurrentSong(song);
    await play();
    navigation.navigate('Player');
  };

  const handleRemove = (index: number) => {
    removeFromQueue(index);
  };

  const handleReorder = ({ data }: { data: Song[] }) => {
    setQueue(data);
    const newIndex = data.findIndex(s => s.id === currentSong?.id);
    if (newIndex !== -1) {
      setCurrentIndex(newIndex);
    }
  };

  const getImageUrl = (song: Song): string => {
    const image = song.image?.find(img => img.quality === '500x500') 
      || song.image?.find(img => img.quality === '150x150')
      || song.image?.[0];
    return image?.link || image?.url || '';
  };

  const formatDuration = (duration: string | number): string => {
    const seconds = typeof duration === 'string' ? parseInt(duration) : duration;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderItem = ({ item, getIndex, drag, isActive }: RenderItemParams<Song>) => {
    const index = getIndex() ?? 0;
    const isCurrentSong = currentSong?.id === item.id && currentIndex === index;

    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          onPress={() => handlePlaySong(item, index)}
          style={[
            styles.queueItem,
            isCurrentSong && styles.currentQueueItem,
            isActive && styles.activeItem,
          ]}
        >
          <View style={styles.dragHandle}>
            <Ionicons name="reorder-three" size={24} color="#8E8E93" />
          </View>
          
          <Image
            source={{ uri: getImageUrl(item) }}
            style={styles.queueImage}
          />
          
          <View style={styles.queueInfo}>
            <Text style={[styles.queueSongName, isCurrentSong && styles.currentSongText]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.queueArtist} numberOfLines={1}>
              {item.primaryArtists || item.artists?.primary?.map(a => a.name).join(', ') || 'Unknown Artist'}
            </Text>
          </View>

          <View style={styles.queueActions}>
            {isCurrentSong && (
              <Ionicons name="musical-note" size={20} color="#007AFF" style={styles.playingIcon} />
            )}
            <Text style={styles.queueDuration}>{formatDuration(item.duration)}</Text>
            <TouchableOpacity
              onPress={() => handleRemove(index)}
              style={styles.removeButton}
            >
              <Ionicons name="close-circle" size={24} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Queue</Text>
        <Text style={styles.subtitle}>{queue.length} songs</Text>
      </View>

      {queue.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="list-outline" size={64} color="#C7C7CC" />
          <Text style={styles.emptyText}>Your queue is empty</Text>
          <Text style={styles.emptySubtext}>Add songs from the Home screen</Text>
        </View>
      ) : (
        <DraggableFlatList
          data={queue}
          onDragEnd={handleReorder}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentQueueItem: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  activeItem: {
    opacity: 0.8,
  },
  dragHandle: {
    marginRight: 8,
  },
  queueImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#E5E5EA',
  },
  queueInfo: {
    flex: 1,
    marginLeft: 12,
  },
  queueSongName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  currentSongText: {
    color: '#007AFF',
  },
  queueArtist: {
    fontSize: 14,
    color: '#8E8E93',
  },
  queueActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  playingIcon: {
    marginRight: 8,
  },
  queueDuration: {
    fontSize: 12,
    color: '#8E8E93',
    marginRight: 8,
  },
  removeButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#8E8E93',
  },
});

export default QueueScreen;

