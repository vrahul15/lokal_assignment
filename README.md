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

