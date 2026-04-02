import { createMMKV } from 'react-native-mmkv';

const mmkv = createMMKV({ id: 'settings' });

export const storage = {
  getString: (key: string): string | undefined => mmkv.getString(key),
  getBoolean: (key: string): boolean | undefined => mmkv.getBoolean(key),
  set: (key: string, value: string | boolean | number): void => mmkv.set(key, value),
};
