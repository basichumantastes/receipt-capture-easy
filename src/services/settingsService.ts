// This file has been deprecated in favor of useSettingsQuery.ts
// Keeping a minimal version for backwards compatibility

import { clearSettingsCache as clearCacheFromHook } from "@/hooks/useSettingsQuery";

// Function to clear settings cache (useful on logout)
export function clearSettingsCache() {
  clearCacheFromHook();
}

// These functions are kept for backward compatibility but will use the new hooks internally
export const fetchSettings = async () => {
  console.warn('fetchSettings is deprecated. Use useSettingsQuery hook instead.');
  return null;
};

export const saveSettings = async () => {
  console.warn('saveSettings is deprecated. Use useSaveSettingsMutation hook instead.');
  return { success: false, error: new Error('Function deprecated') };
};
