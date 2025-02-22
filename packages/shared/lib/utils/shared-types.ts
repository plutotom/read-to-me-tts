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
  elevenlabsVoiceName?: string;
  elevenlabsModelId?: string;
  elevenlabsModelName?: string;

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

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  samples?: null;
  category?: string;
  fine_tuning?: {
    is_allowed_to_fine_tune?: boolean;
    state?: {
      [model: string]: string;
    };
    verification_failures?: Array<any>;
    verification_attempts_count?: number;
    manual_verification_requested?: boolean;
    language?: string;
    progress?: {
      [model: string]: number;
    };
    message?: {
      [model: string]: string;
    };
    dataset_duration_seconds?: null;
    verification_attempts?: null;
    slice_ids?: null;
    manual_verification?: null;
    max_verification_attempts?: number;
    next_max_verification_attempts_reset_unix_ms?: number;
  };
  labels?: {
    accent?: string;
    description?: string;
    age?: string;
    gender?: string;
    use_case?: string;
  };
  description?: null;
  preview_url?: string;
  available_for_tiers?: Array<any>;
  settings?: null;
  sharing?: null;
  high_quality_base_model_ids?: Array<string>;
  safety_control?: null;
  voice_verification?: {
    requires_verification?: boolean;
    is_verified?: boolean;
    verification_failures?: Array<any>;
    verification_attempts_count?: number;
    language?: null;
    verification_attempts?: null;
  };
  permission_on_resource?: null;
  is_owner?: boolean;
  is_legacy?: boolean;
  is_mixed?: boolean;
  created_at_unix?: null;
}

interface ElevenLabsModel {
  model_id: string;
  name: string;
  can_be_finetuned: boolean;
  can_do_text_to_speech: boolean;
  can_do_voice_conversion: boolean;
  can_use_style: boolean;
  can_use_speaker_boost: boolean;
  serves_pro_voices: boolean;
  token_cost_factor: number;
  description: string;
  requires_alpha_access: boolean;
  max_characters_request_free_user: number;
  max_characters_request_subscribed_user: number;
  maximum_text_length_per_request: number;
  languages: Array<{
    language_id: string;
    name: string;
  }>;
  model_rates: {
    character_cost_multiplier: number;
  };
  concurrency_group: string;
}

export type { TTSSettings, CustomHeader, CustomBodyParam, ElevenLabsVoice, ElevenLabsModel };
