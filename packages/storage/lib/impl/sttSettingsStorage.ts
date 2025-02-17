import { StorageEnum } from '../base/enums';
import { createStorage } from '../base/base';
import type { BaseStorage } from '../base/types';
import type { TTSSettings } from '../../../shared/lib/utils/shared-types';

// Define the current version of the storage schema
const CURRENT_VERSION = 5;

interface TTSSettingsWithVersion extends TTSSettings {
  _version?: number;
}

const defaultSettings: TTSSettingsWithVersion = {
  _version: CURRENT_VERSION,
  ttsProvider: 'azure',
  ttsProviders: ['azure', 'elevenlabs', 'customServer'],
  azureSubscriptionKey: '',
  azureRegion: '',
  azureVoice: '',
  elevenlabsApiKey: '',
  elevenlabsVoiceId: '',
  elevenlabsVoiceName: '',
  elevenlabsModel: '',
  customServerEndpoint: '',
  customServerApiKey: '',
  customServerHeaders: [],
  customServerBodyParams: [],
  customServerTextKey: '',
};

// Create storage with migration support
const ttsStorage = createStorage<TTSSettingsWithVersion>('tts-storage-key', defaultSettings, {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
});

// Initialize storage and run migration check
const initializeStorage = async () => {
  const initialSnapshot = await ttsStorage.get();
  await TTSSettingsStorage.onInit(initialSnapshot);
};

// add the setting types to the storage and add the methods to the storage
type TTSSettingsStorage = BaseStorage<TTSSettings> & {
  selectTTSProvider: (provider: TTSSettings['ttsProvider']) => Promise<void>;
  onInit: (stored: TTSSettingsWithVersion) => Promise<TTSSettingsWithVersion>;
};

export const TTSSettingsStorage: TTSSettingsStorage = {
  ...ttsStorage,
  selectTTSProvider: async (provider: TTSSettings['ttsProvider']) => {
    await ttsStorage.set(currentSettings => {
      return { ...currentSettings, ttsProvider: provider };
    });
  },
  onInit: async stored => {
    if (!stored || stored._version !== CURRENT_VERSION) {
      const migratedSettings = {
        ...defaultSettings,
        ...stored,
        _version: CURRENT_VERSION,
      };
      await ttsStorage.set(() => migratedSettings);
      return migratedSettings;
    }
    return stored;
  },
};

// Run initialization
initializeStorage().catch(error => {
  console.error('Failed to initialize TTS settings:', error);
});
