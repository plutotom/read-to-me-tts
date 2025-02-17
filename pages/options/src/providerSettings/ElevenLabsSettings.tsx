import { TTSSettings, useStorage, ElevenLabsVoice, ElevenLabsModel } from '@extension/shared';
import { TTSSettingsStorage } from '@extension/storage';
import { useEffect, useState } from 'react';
import { Input } from '@extension/ui/lib/components/cn/input';
import { Label } from '@extension/ui/lib/components/cn/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@extension/ui/lib/components/cn/select';
import { Button } from '@extension/ui/lib/components/cn/button';

const ElevenLabsSettings = () => {
  const settings = useStorage(TTSSettingsStorage);
  const [tempSettings, setTempSettings] = useState<TTSSettings>(settings);
  const [voices, setVoices] = useState<ElevenLabsVoice[]>([]);
  const [models, setModels] = useState<ElevenLabsModel[]>([]);
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const handleSave = async () => {
    await TTSSettingsStorage.set(tempSettings);
  };

  useEffect(() => {
    const unsubscribe = TTSSettingsStorage.subscribe(() => {
      const latestSettings = TTSSettingsStorage.getSnapshot();
      setTempSettings(latestSettings || {});
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (value: string, key: keyof TTSSettings) => {
    setTempSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const loadVoices = async () => {
    if (!tempSettings.elevenlabsApiKey) {
      alert('Please enter your ElevenLabs API Key first.');
      return;
    }

    setIsLoadingVoices(true);
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': tempSettings.elevenlabsApiKey,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load voices');
      }

      const data = await response.json();
      setVoices(data.voices as ElevenLabsVoice[]);
    } catch (error) {
      alert('Error loading voices and models: ' + (error as Error).message);
    } finally {
      setIsLoadingVoices(false);
    }
  };

  const loadModels = async () => {
    if (!tempSettings.elevenlabsApiKey) {
      alert('Please enter your ElevenLabs API Key first.');
      return;
    }

    setIsLoadingModels(true);
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/models', {
        headers: {
          'xi-api-key': tempSettings.elevenlabsApiKey,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load models');
      }

      const data = await response.json();
      setModels(data as ElevenLabsModel[]);
    } catch (error) {
      alert('Error loading models: ' + (error as Error).message);
    } finally {
      setIsLoadingModels(false);
    }
  };

  return (
    <div>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">ElevenLabs</h1>
      <div className="flex flex-col gap-4">
        <div>
          <Label htmlFor="elevenlabsApiKey">API Key</Label>
          <Input
            id="elevenlabsApiKey"
            value={tempSettings.elevenlabsApiKey}
            onChange={e => handleChange(e.target.value, 'elevenlabsApiKey')}
            onBlur={handleSave}
            type="password"
          />
        </div>

        <Button onClick={loadVoices} disabled={isLoadingVoices || !tempSettings.elevenlabsApiKey}>
          {isLoadingVoices ? 'Loading...' : 'Load Voices'}
        </Button>
        <Button onClick={loadModels} disabled={isLoadingModels || !tempSettings.elevenlabsApiKey}>
          {isLoadingModels ? 'Loading...' : 'Load Models'}
        </Button>

        <div>
          <Label htmlFor="elevenlabsVoiceId">Voice</Label>
          <Select
            value={tempSettings.elevenlabsVoiceId}
            onValueChange={value => {
              handleChange(value, 'elevenlabsVoiceId');
              handleSave();
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
          <Label htmlFor="elevenlabsModel">Model</Label>
          <Select
            value={tempSettings.elevenlabsModel}
            onValueChange={value => {
              handleChange(value, 'elevenlabsModel');
              handleSave();
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
