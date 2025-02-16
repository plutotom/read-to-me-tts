export type ValueOf<T> = T[keyof T];
// Define interfaces for settings and other types
interface TTSSettings {
  ttsProvider?: 'azure' | 'elevenlabs' | 'customServer';
  ttsProviders?: Array<'azure' | 'elevenlabs' | 'customServer'>;

  azureSubscriptionKey?: string;
  azureRegion?: string;
  azureVoice?: string;

  elevenlabsApiKey?: string;
  elevenlabsVoiceId?: string;
  elevenlabsModel?: string;

  customServerEndpoint?: string;
  customServerApiKey?: string;
  customServerHeaders?: Array<{ key: string; value: string }>;
  customServerBodyParams?: Array<{ key: string; value: string }>;
  customServerTextKey?: string;
}

interface CustomHeader {
  key: string;
  value: string;
}

interface CustomBodyParam {
  key: string;
  value: string;
}

export type { TTSSettings, CustomHeader, CustomBodyParam };
