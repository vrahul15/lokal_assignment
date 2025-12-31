import axios from 'axios';
import { SearchResponse, SongDetailResponse, Song } from '../types';

const BASE_URL = 'https://saavn.sumit.co';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export const searchSongs = async (query: string, page: number = 1): Promise<SearchResponse> => {
  try {
    const response = await api.get<SearchResponse>('/api/search/songs', {
      params: {
        query,
        page,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching songs:', error);
    throw error;
  }
};

export const searchAlbums = async (query: string, page: number = 1): Promise<SearchResponse> => {
  try {
    const response = await api.get<SearchResponse>('/api/search/albums', {
      params: {
        query,
        page,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching albums:', error);
    throw error;
  }
};

export const searchArtists = async (query: string, page: number = 1): Promise<SearchResponse> => {
  try {
    const response = await api.get<SearchResponse>('/api/search/artists', {
      params: {
        query,
        page,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching artists:', error);
    throw error;
  }
};

export const getSongById = async (id: string): Promise<Song> => {
  try {
    const response = await api.get<SongDetailResponse>(`/api/songs/${id}`);
    if (response.data.success && response.data.data.length > 0) {
      return response.data.data[0];
    }
    throw new Error('Song not found');
  } catch (error) {
    console.error('Error fetching song:', error);
    throw error;
  }
};

export const getSongSuggestions = async (id: string): Promise<Song[]> => {
  try {
    const response = await api.get<SongDetailResponse>(`/api/songs/${id}/suggestions`);
    if (response.data.success) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching song suggestions:', error);
    return [];
  }
};

export const getArtistSongs = async (id: string): Promise<Song[]> => {
  try {
    const response = await api.get<SongDetailResponse>(`/api/artists/${id}/songs`);
    if (response.data.success) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching artist songs:', error);
    return [];
  }
};

export const getArtistAlbums = async (id: string): Promise<any[]> => {
  try {
    const response = await api.get(`/api/artists/${id}/albums`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching artist albums:', error);
    return [];
  }
};

export default api;

