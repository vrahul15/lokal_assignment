import React, { useState, useCallback } from 'react';
import { useWindowDimensions } from 'react-native';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  SafeAreaView,
  ImageBackground,
  Pressable,
} from 'react-native';
import { usePlayerStore } from '../store/usePlayerStore';
import { searchSongs } from '../services/api';
import { Song } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const { setCurrentSong, setQueue, addToQueue, setCurrentIndex, play } =
    usePlayerStore();

  const handleSearch = useCallback(
    async (query: string, pageNum: number = 1) => {
      if (!query.trim()) {
        setSongs([]);
        setPage(1);
        setHasMore(true);
        return;
      }

      setLoading(true);
      try {
        const response = await searchSongs(query, pageNum);

        // `searchSongs` returns a SearchResponse where results are at `response.data.results`
        const results = response?.data?.results || [];

        if (pageNum === 1) {
          setSongs(results);
        } else {
          setSongs(prev => [...prev, ...results]);
        }

        setHasMore(results.length > 0);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleSearchSubmit = () => {
    setPage(1);
    handleSearch(searchQuery, 1);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      handleSearch(searchQuery, nextPage);
    }
  };

  const handlePlaySong = async (song: Song, index: number) => {
    const currentSongs = songs.length > 0 ? songs : [song];
    setQueue(currentSongs);
    setCurrentIndex(index);
    setCurrentSong(song);
    await play();
    navigation.navigate('Player');
  };

  const handleAddToQueue = (song: Song) => {
    addToQueue(song);
  };

  const getImageUrl = (song: Song): string => {
    const image =
      song.image?.find(img => img.quality === '500x500') ||
      song.image?.find(img => img.quality === '150x150') ||
      song.image?.[0];

    return image?.link || image?.url || '';
  };

  const formatDuration = (duration: string | number): string => {
    const seconds = typeof duration === 'string' ? parseInt(duration) : duration;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const { width } = useWindowDimensions();
  const isLarge = width >= 768;
  const cardPadding = isLarge ? 14 : 8;
  const imageSize = isLarge ? 96 : 64;
  const emptyImageWidth = Math.min(480, Math.max(200, Math.floor(width * 0.6)));
  // Suggested carousel assets (light variants). These are static requires so bundler includes them.
  const suggestedItems = [
    { src: require('../../assets/5_Light_home suggested.png'), title: 'Suggested' },
    { src: require('../../assets/6_Light_home songs.png'), title: 'Popular Songs' },
    { src: require('../../assets/12_Light_home artists.png'), title: 'Top Artists' },
    { src: require('../../assets/15_Light_home albums.png'), title: 'New Albums' },
  ];
  const carouselItemWidth = isLarge ? Math.min(420, Math.floor(width * 0.45)) : Math.min(320, Math.floor(width * 0.8));

  const renderSongItem = ({ item, index }: { item: Song; index: number }) => (
    <TouchableOpacity
      style={[styles.songItem, { padding: cardPadding, borderRadius: isLarge ? 16 : 12 }]}
      onPress={() => handlePlaySong(item, index)}
    >
      <Image source={{ uri: getImageUrl(item) }} style={[styles.songImage, { width: imageSize, height: imageSize, borderRadius: Math.round(imageSize * 0.12) }]} />

      <View style={styles.songInfo}>
        <Text style={styles.songName} numberOfLines={1}>
          {item.name}
        </Text>

        <Text style={styles.songArtist} numberOfLines={1}>
          {item.primaryArtists ||
            item.artists?.primary?.map(a => a.name).join(', ') ||
            'Unknown Artist'}
        </Text>

        <Text style={styles.songAlbum}>
          {item.album?.name || 'Unknown Album'}
        </Text>
      </View>

      <View style={styles.songActions}>
        <Text style={styles.songDuration}>{formatDuration(item.duration)}</Text>

        <TouchableOpacity onPress={() => handleAddToQueue(item)}>
          <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require('../../assets/22_Light_search results list.png')}
      style={styles.bg}
      resizeMode="cover"
      imageStyle={{ opacity: 0.06 }}
    >
      <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Music Player</Text>
      </View>

      {/* Suggested carousel */}
      <View style={styles.carouselWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {suggestedItems.map((it, i) => (
            <Pressable
              key={i}
              style={[styles.carouselCard, { width: carouselItemWidth }]}
              onPress={() => {
                // For now, pressing suggested opens search with title
                setSearchQuery(it.title);
                handleSearch(it.title, 1);
              }}
            >
              <Image source={it.src} style={[styles.carouselImage, { width: carouselItemWidth - 24, height: Math.round((carouselItemWidth - 24) * 0.48) }]} resizeMode="cover" />
              <View style={styles.carouselTextWrap}>
                <Text style={styles.carouselTitle}>{it.title}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#8E8E93"
          style={styles.searchIcon}
        />

        <TextInput
          style={styles.searchInput}
          placeholder="Search songs..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />

        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              setSongs([]);
              setPage(1);
              setHasMore(true);
            }}
          >
            <Ionicons name="close-circle" size={20} color="#8E8E93" />
          </TouchableOpacity>
        )}
      </View>

      {loading && songs.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : songs.length === 0 ? (
        <View style={styles.emptyState}>
        
          <Text style={styles.emptyText}>Search for your favorite songs</Text>
        </View>
      ) : (
        <FlatList
          data={songs}
          renderItem={renderSongItem}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.listContent, { paddingHorizontal: isLarge ? 32 : 16 }]}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && songs.length > 0 ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : null
          }
          // Improve visual density on wide screens
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      )}
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#000' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 44, fontSize: 16, color: '#000' },
  listContent: { padding: 16 },
  songItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 8,
    marginBottom: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  songImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#E5E5EA',
  },
  songInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  songName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  songArtist: { fontSize: 14, color: '#8E8E93', marginBottom: 2 },
  songAlbum: { fontSize: 12, color: '#C7C7CC' },
  songActions: { justifyContent: 'space-between', alignItems: 'center' },
  songDuration: { fontSize: 12, color: '#8E8E93' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { marginTop: 16, fontSize: 16, color: '#8E8E93' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyImage: { width: 240, height: 160, opacity: 0.9 },
  bg: { flex: 1, backgroundColor: '#F5F5F5' },
  carouselWrapper: { marginTop: 8, marginBottom: 8 },
  carouselCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginRight: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  carouselImage: {
    borderRadius: 10,
    backgroundColor: '#EEE',
  },
  carouselTextWrap: { marginTop: 8 },
  carouselTitle: { fontSize: 16, fontWeight: '600', color: '#111' },
});

export default HomeScreen;
