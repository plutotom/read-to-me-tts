import { TTSSettings, useStorage, ElevenLabsVoice, ElevenLabsModel } from '@extension/shared';
import { TTSSettingsStorage } from '@extension/storage';
import { useEffect, useState } from 'react';
import { Input } from '@extension/ui/lib/components/cn/input';
import { Label } from '@extension/ui/lib/components/cn/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@extension/ui/lib/components/cn/select';
import { Button } from '@extension/ui/lib/components/cn/button';
import { Alert, AlertDescription, AlertTitle } from '@extension/ui/lib/components/cn/alert';
const ElevenLabsSettings = () => {
  const settings = useStorage(TTSSettingsStorage);
  const [voices, setVoices] = useState<ElevenLabsVoice[]>([]);
  const [models, setModels] = useState<ElevenLabsModel[]>([]);
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (settings.elevenlabsApiKey) {
      loadVoices();
      loadModels();
    }
  }, []);

  const loadVoices = async () => {
    if (!settings.elevenlabsApiKey) {
      setError('Please enter your ElevenLabs API Key first.');
      return;
    }

    setIsLoadingVoices(true);
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': settings.elevenlabsApiKey,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load voices');
      }

      const data = await response.json();
      setVoices(data.voices as ElevenLabsVoice[]);
    } catch (error) {
      setError('Error loading voices: ' + (error as Error).message);
    } finally {
      setIsLoadingVoices(false);
    }
  };

  const loadModels = async () => {
    if (!settings.elevenlabsApiKey) {
      setError('Please enter your ElevenLabs API Key first.');
      return;
    }

    setIsLoadingModels(true);
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/models', {
        headers: {
          'xi-api-key': settings.elevenlabsApiKey,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load models');
      }

      const data = await response.json();
      setModels(data as ElevenLabsModel[]);
    } catch (error) {
      setError('Error loading models: ' + (error as Error).message);
    } finally {
      setIsLoadingModels(false);
    }
  };

  return (
    <div>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">ElevenLabs</h1>
      <div className="flex flex-col gap-4">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div>
          <Label htmlFor="elevenlabsApiKey">API Key</Label>
          <Input
            id="elevenlabsApiKey"
            value={settings.elevenlabsApiKey}
            onChange={e => {
              TTSSettingsStorage.set(prev => ({
                ...prev,
                elevenlabsApiKey: e.target.value,
              }));
            }}
            type="password"
          />
        </div>
        <Button onClick={loadVoices} disabled={isLoadingVoices || !settings.elevenlabsApiKey}>
          {isLoadingVoices ? 'Loading...' : 'Load Voices'}
        </Button>
        <Button onClick={loadModels} disabled={isLoadingModels || !settings.elevenlabsApiKey}>
          {isLoadingModels ? 'Loading...' : 'Load Models'}
        </Button>

        <div>
          <Label htmlFor="elevenlabsVoiceId">Voice</Label>
          <Select
            value={settings.elevenlabsVoiceId}
            onValueChange={voiceId => {
              const selectedVoice = voices.find(v => v.voice_id === voiceId);
              TTSSettingsStorage.set({
                ...settings,
                elevenlabsVoiceId: voiceId,
                elevenlabsVoiceName: selectedVoice?.name,
              });
            }}>
            <SelectTrigger>
              <SelectValue placeholder="Select voice" />
            </SelectTrigger>
            <SelectContent>
              {voices.map(voice => (
                <SelectItem key={voice.voice_id} value={voice.voice_id}>
                  {voice.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="elevenlabsModelId">Model</Label>
          <Select
            value={settings.elevenlabsModelId}
            onValueChange={modelId => {
              const selectedModel = models.find(m => m.model_id === modelId);
              TTSSettingsStorage.set({
                ...settings,
                elevenlabsModelId: modelId,
                elevenlabsModelName: selectedModel?.name,
              });
            }}>
            <SelectTrigger>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {models.map(model => (
                <SelectItem key={model.model_id} value={model.model_id}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ElevenLabsSettings;
