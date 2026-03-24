import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nandidev.kmporitro',
  appName: 'Km por Litro',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    Preferences: {
      group: 'NativeStorage',
    },
  },
};

export default config;
