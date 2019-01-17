import { DB } from '../utils/db';

export const actions = store => ({
  boot: async (state, dbPromise) => {
    const db = new DB(dbPromise);

    const settingKeys = await db.keys('settings');
    const savedSettings = await settingKeys.reduce(async (current, key) => {
      current[key] = await db.get('settings', key);
      return current;
    }, {});

    return { db, settings: { ...state.settings, ...savedSettings } };
  },

  updateSetting: (state, { key = '', value = '' }) => {
    if (!state.db) return;

    const settings = { ...state.settings };
    settings[key] = value;

    state.db.set('settings', key, value);

    return { settings };
  },
});
