# Troubleshooting: App Running But Not Showing Anything

## Quick Checks

### 1. Is the App Actually Open?
- **Expo Go**: Make sure you've scanned the QR code and the app loaded on your device
- **Emulator**: Check if the emulator window is open and showing the app
- **Web**: Check if the browser tab opened and shows the app

### 2. Check for Errors

**In the Terminal:**
- Look for red error messages
- Check for any "Failed to load" messages
- Look for Metro bundler errors

**In Expo Go/Device:**
- Shake your device to open the developer menu
- Check "Show Element Inspector" for errors
- Look at the console logs

**In Browser (if using web):**
- Open Developer Tools (F12)
- Check Console tab for errors
- Check Network tab for failed requests

### 3. Common Issues & Solutions

#### Blank White Screen
```bash
# Stop the server (Ctrl+C) and restart with cache clear
npm start -- --reset-cache
```

#### "Unable to resolve module" errors
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
npm start
```

#### App not connecting
- Make sure phone and computer are on same WiFi
- Try tunnel mode:
```bash
npx expo start --tunnel
```

#### Metro bundler stuck
```bash
# Kill all node processes and restart
# Windows:
taskkill /F /IM node.exe
npm start
```

### 4. Verify App is Loading

The app should show:
1. **Loading screen** (briefly) - "Loading..." text
2. **Home screen** - Search bar and empty state message
3. **Bottom tabs** - Home and Queue icons

If you see a blank screen:
- Check terminal for errors
- Try the cache clear command above
- Check if all dependencies installed correctly

### 5. Test Basic Functionality

Once the app loads:
1. You should see "Music Player" title
2. Search bar should be visible
3. Empty state: "Search for your favorite songs"
4. Bottom tabs should show Home and Queue icons

### 6. Debug Steps

**Step 1: Check Terminal Output**
```bash
# Look for these messages:
✓ Metro bundler is running
✓ QR code displayed
✓ "Waiting for connection..."
```

**Step 2: Check Device Connection**
- In Expo Go: Should show "Connected"
- In terminal: Should show "Connected to [device name]"

**Step 3: Check for JavaScript Errors**
- Shake device → "Show Element Inspector"
- Look for red error messages
- Check "Logs" for warnings

**Step 4: Restart Everything**
```bash
# Stop server (Ctrl+C)
# Clear cache and restart
npm start -- --reset-cache
```

### 7. Still Not Working?

If the app still shows nothing:

1. **Check package.json** - Make sure all dependencies are listed
2. **Verify node_modules** - Run `npm install` again
3. **Check TypeScript** - Run `npx tsc --noEmit` to check for errors
4. **Try web version** - `npm run web` to test in browser
5. **Check app.json** - Verify Expo configuration is correct

### 8. Get Help

If nothing works, provide:
- Screenshot of terminal output
- Screenshot of device/emulator
- Error messages from console
- Output of `npm list` command

