 Lokal Music Player

A mobile music streaming app built using React Native + Expo, featuring:

Search songs

Full player + mini player

Queue management

Background playback

Smooth animations

✅ APK Download

Download here:
👉 [https://your-apk-link](https://expo.dev/accounts/vrahul2215s-organization/projects/lokal-music-player/builds/e793745e-c951-4eb6-a101-b17358cc70f7)

🚀 Setup & Running Locally
git clone https://github.com/<username>/lokal-music-player.git
cd lokal-music-player
npm install
npx expo start


To run on Android:

press a

🏗️ Architecture
🔹 Tech Stack

React Native (Expo SDK 50)

React Navigation → navigation + bottom tabs

Expo AV → audio playback

MMKV (or AsyncStorage) → persistent queue

🔹 High-Level Flow

1️⃣ User searches song
2️⃣ On play:

Queue is set

Current song stored

Player screen opens

Mini player syncs automatically

3️⃣ Audio engine handles:

Play / Pause

Seek

Next / Previous

Background play

🔹 Project Structure

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
