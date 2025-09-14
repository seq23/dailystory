import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.592147a710504b6caf2b895053e775df',
  appName: 'time-2-read',
  webDir: 'dist',
  server: {
    url: 'https://592147a7-1050-4b6c-af2b-895053e775df.lovableproject.com?forceHideBadge=true&debug=1&ttsdebug=1&storydebug=1',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'default',
      backgroundColor: '#ffffff'
    }
  }
};

export default config;