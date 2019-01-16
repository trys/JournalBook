import { DB } from '../utils/db';
const db = new DB();

export const actions = store => ({
  updateSetting: (state, { key = '', value = '' }) => {
    const settings = { ...state.settings };
    settings[key] = value;

    db.set('settings', key, value);

    return {
      settings,
    };
  },

  getSettings: async state => {
    const settingKeys = await db.keys('settings');
    const savedSettings = await settingKeys.reduce(async (current, key) => {
      current[key] = await db.get('settings', key);
      return current;
    }, {});

    return {
      settings: {
        ...state.settings,
        ...savedSettings,
      },
    };
  },
});
