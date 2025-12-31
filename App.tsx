import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform } from 'react-native';

// Web compatibility shim: translate deprecated props used by some libraries
// - map `props.pointerEvents` -> `style.pointerEvents`
// - convert common RN shadow props to `boxShadow`
if (Platform.OS === 'web') {
  try {
    const r: any = React;
    const originalCreateElement = r.createElement;
    r.createElement = (type: any, props: any, ...children: any[]) => {
      if (props && typeof props === 'object') {
        // Pointer events prop -> style
        if ('pointerEvents' in props) {
          const pe = props.pointerEvents;
          const style = Array.isArray(props.style) ? Object.assign({}, ...props.style) : (props.style || {});
          style.pointerEvents = pe;
          props = Object.assign({}, props, { style });
          delete props.pointerEvents;
        }

        // Shadow props -> boxShadow
        const style = Array.isArray(props.style) ? Object.assign({}, ...props.style) : (props.style || {});
        const hasShadow = style && (style.shadowColor || style.shadowOffset || style.shadowOpacity || style.shadowRadius || style.elevation);
        if (hasShadow) {
          const { shadowColor, shadowOffset, shadowOpacity, shadowRadius, elevation } = style;
          const offsetX = (shadowOffset && shadowOffset.width) || 0;
          const offsetY = (shadowOffset && shadowOffset.height) || 0;
          const blur = shadowRadius ?? (elevation ? Math.round(elevation * 1.5) : 0);
          const opacity = typeof shadowOpacity === 'number' ? shadowOpacity : (elevation ? 0.3 : 0.2);
          // Basic rgba conversion for shadowColor if it's a hex; fallback to black
          let color = '0,0,0';
          try {
            if (typeof shadowColor === 'string') {
              const hex = shadowColor.replace('#', '');
              if (hex.length === 6) {
                const rC = parseInt(hex.substring(0, 2), 16);
                const gC = parseInt(hex.substring(2, 4), 16);
                const bC = parseInt(hex.substring(4, 6), 16);
                color = `${rC},${gC},${bC}`;
              }
            }
          }
          catch (e) { }
          const boxShadow = `${offsetX}px ${offsetY}px ${blur}px rgba(${color}, ${opacity})`;
          const newStyle = Object.assign({}, style, { boxShadow });
          // remove RN shadow props to silence deprecation warnings
          delete newStyle.shadowColor;
          delete newStyle.shadowOffset;
          delete newStyle.shadowOpacity;
          delete newStyle.shadowRadius;
          delete newStyle.elevation;
          props = Object.assign({}, props, { style: newStyle });
        }
      }
      return originalCreateElement(type, props, ...children);
    };
  }
  catch (e) {
    // If shim fails, don't block the app. We'll still try to run normally.
    // eslint-disable-next-line no-console
    console.warn('Web prop shim initialization failed:', e);
  }
}
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { usePlayerStore } from './src/store/usePlayerStore';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialize = usePlayerStore((state) => state.initialize);
  const currentSong = usePlayerStore((state) => state.currentSong);

  useEffect(() => {
    const init = async () => {
      try {
        await initialize();
        setIsReady(true);
      } catch (err: any) {
        console.error('Initialization error:', err);
        setError(err?.message || 'Failed to initialize app');
        setIsReady(true); // Still show the app even if initialization fails
      }
    };
    init();
  }, [initialize]);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    console.warn('App initialization warning:', error);
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <View style={styles.container}>
          <AppNavigator />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  miniPlayerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
});
