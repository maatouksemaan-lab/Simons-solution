import type { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.simonssolutions.app',
  appName: "Simon's Solutions",
  webDir: 'out',
  // Production server URL — override with CAPACITOR_SERVER_URL env var for local dev
  server: {
    url: process.env.CAPACITOR_SERVER_URL || 'https://www.simonssolutions.com',
    cleartext: false,
    androidScheme: 'https',
    // Allow the production domain and the Rocket.new dev URL
    allowNavigation: [
      'simonssolutions.com',
      '*.simonssolutions.com',
      'simonssolu1089.builtwithrocket.new',
      '*.supabase.co',
    ],
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: true,
      backgroundColor: '#0f172a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      iosSpinnerStyle: 'small',
      spinnerColor: '#6366f1',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0f172a',
    },
    App: {
      // Deep link URL scheme
    },
  },
  android: {
    buildOptions: {
      keystorePath: 'release.keystore',
      keystoreAlias: 'simonssolutions',
    },
    // Allow cleartext only for local dev — production uses HTTPS
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    limitsNavigationsToAppBoundDomains: true,
    preferredContentMode: 'mobile',
  },
};

export default config;
