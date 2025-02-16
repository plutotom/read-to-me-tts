import { StorageEnum } from '../base/enums';
import { createStorage } from '../base/base';
import type { BaseStorage } from '../base/types';
import type { TTSSettings } from '../../../shared/lib/utils/shared-types';

type STTVoiceStorage = BaseStorage<string> & {
  setVoice: (voice: string) => Promise<void>;
};

const sttVoiceStorage = createStorage<string>('stt-voice-storage-key', '', {
  storageEnum: StorageEnum.Session,
  liveUpdate: true,
});

export const STTVoiceStorage: STTVoiceStorage = {
  ...sttVoiceStorage,
  setVoice: async (voice: string) => {
    await sttVoiceStorage.set(voice);
  },
};
