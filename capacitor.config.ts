import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.592147a710504b6caf2b895053e775df',
  appName: 'dailystory',
  webDir: 'dist',
  server: {
    url: 'https://preview--dailystory.lovable.app/?forceHideBadge=true&debug=1&ttsdebug=1&storydebug=1',
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