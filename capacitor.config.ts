import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zuacar.app',
  appName: 'ZuaCar',
  webDir: 'public',
  server: {
    url: 'https://app.zua-car.com/',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
