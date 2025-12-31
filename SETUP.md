# Setup Instructions

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device (for testing)

## Installation Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Run on your device:**
   - Scan the QR code with Expo Go (iOS) or the Expo app (Android)
   - Or press `i` for iOS simulator, `a` for Android emulator

## Project Structure

```
lokal_assignment/
├── src/
│   ├── components/          # Reusable components
│   │   └── MiniPlayer.tsx   # Mini player component
│   ├── context/             # React contexts
│   ├── navigation/          # Navigation setup
│   │   └── AppNavigator.tsx
│   ├── screens/             # Screen components
│   │   ├── HomeScreen.tsx  # Search and song list
│   │   ├── PlayerScreen.tsx # Full player screen
│   │   └── QueueScreen.tsx  # Queue management
│   ├── services/            # API and external services
│   │   ├── api.ts          # JioSaavn API integration
│   │   └── downloadService.ts # Download functionality
│   ├── store/              # State management
│   │   └── usePlayerStore.ts # Zustand store
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   └── utils/              # Utility functions
│       └── storage.ts     # MMKV storage utilities
├── App.tsx                 # Root component
├── package.json
└── tsconfig.json
```

## Key Features

### Core Features
- ✅ Song search with pagination
- ✅ Full-featured music player
- ✅ Mini player that syncs with full player
- ✅ Queue management with drag-to-reorder
- ✅ Background playback support

### Bonus Features
- ✅ Shuffle mode
- ✅ Repeat modes (None, All, One)
- ✅ Download songs for offline listening

## API Endpoints Used

- `GET /api/search/songs` - Search for songs
- `GET /api/songs/{id}` - Get song details
- `GET /api/songs/{id}/suggestions` - Get song suggestions
- `GET /api/artists/{id}/songs` - Get artist songs

## State Management

The app uses Zustand for state management. The main store (`usePlayerStore`) manages:
- Current song
- Playback state (playing, paused, current time, duration)
- Queue
- Repeat and shuffle modes

## Storage

MMKV is used for persistent storage:
- Queue persistence
- Current song persistence
- User preferences (repeat/shuffle modes)

## Troubleshooting

### Common Issues

1. **Metro bundler errors:**
   - Clear cache: `npm start -- --reset-cache`

2. **Audio playback issues:**
   - Ensure device volume is up
   - Check internet connection for streaming

3. **Download issues:**
   - Grant media library permissions when prompted
   - Ensure sufficient storage space

## Development Notes

- The app uses Expo AV for audio playback
- Background playback is configured via `setAudioModeAsync`
- Mini Player is positioned absolutely above the tab bar
- Queue can be reordered via drag-and-drop

