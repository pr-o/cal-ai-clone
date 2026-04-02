// localStorage-backed shim with MMKV-compatible API for web
export const storage = {
  getString: (key: string): string | undefined => {
    return localStorage.getItem(key) ?? undefined;
  },
  getBoolean: (key: string): boolean | undefined => {
    const val = localStorage.getItem(key);
    return val === null ? undefined : val === 'true';
  },
  set: (key: string, value: string | boolean | number): void => {
    localStorage.setItem(key, String(value));
  },
};
