# How to Run the Music Player App

## Prerequisites

1. **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
2. **npm** (comes with Node.js)
3. **Expo CLI** (install globally):
   ```bash
   npm install -g expo-cli
   ```
4. **Expo Go app** on your mobile device:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

## Step-by-Step Instructions

### 1. Install Dependencies

Open terminal in the project directory and run:

```bash
npm install
```

This will install all required packages including:
- React Native & Expo
- Navigation libraries
- State management (Zustand)
- Storage (MMKV)
- Audio playback (Expo AV)
- And all other dependencies

### 2. Start the Development Server

```bash
npm start
```

or

```bash
expo start
```

This will:
- Start the Metro bundler
- Display a QR code in the terminal
- Open Expo DevTools in your browser

### 3. Run on Your Device

**Option A: Using Expo Go (Recommended for testing)**
1. Open Expo Go app on your phone
2. Scan the QR code displayed in the terminal
3. The app will load on your device

**Option B: Using Emulator/Simulator**

For iOS (Mac only):
```bash
npm run ios
# or
expo start --ios
```

For Android:
```bash
npm run android
# or
expo start --android
```

**Option C: Using Web Browser**
```bash
npm run web
# or
expo start --web
```

## Troubleshooting

### Metro Bundler Issues

If you encounter cache issues:
```bash
npm start -- --reset-cache
```

### Port Already in Use

If port 8081 is already in use:
```bash
npx expo start --port 8082
```

### TypeScript Errors

If you see TypeScript errors in the IDE:
1. Restart your IDE/editor
2. Run: `npx tsc --noEmit` to check for actual errors
3. Clear TypeScript cache if needed

### Network Issues

- Ensure your phone and computer are on the same WiFi network
- For Android, you might need to use `expo start --tunnel` if on different networks

### Missing Dependencies

If you get module not found errors:
```bash
rm -rf node_modules
npm install
```

## Testing the App

Once the app loads:

1. **Search for Songs**: 
   - Type in the search bar (e.g., "arijit singh")
   - Tap on any song to play

2. **Use the Player**:
   - Tap the mini player at the bottom to open full player
   - Use controls: play, pause, next, previous
   - Drag the seek bar to jump to any position

3. **Manage Queue**:
   - Go to Queue tab
   - Add songs from Home screen using the "+" button
   - Drag songs to reorder
   - Remove songs by tapping the X button

4. **Test Features**:
   - Shuffle mode (shuffle icon)
   - Repeat modes (repeat icon - tap to cycle through None/All/One)
   - Download songs (menu button in player)

## Development Commands

```bash
# Start development server
npm start

# Start with cache reset
npm start -- --reset-cache

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web

# Type check (without building)
npx tsc --noEmit
```

## Project Structure

```
lokal_assignment/
├── src/
│   ├── components/      # MiniPlayer component
│   ├── navigation/      # Navigation setup
│   ├── screens/         # Home, Player, Queue screens
│   ├── services/        # API & download services
│   ├── store/           # Zustand state management
│   ├── types/           # TypeScript types
│   └── utils/           # Storage utilities
├── App.tsx              # Root component
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript config
```

## Notes

- The app requires an internet connection for searching and streaming songs
- Background playback is enabled - music continues when app is minimized
- Queue and preferences are saved locally using MMKV
- First run may take longer as dependencies are downloaded

