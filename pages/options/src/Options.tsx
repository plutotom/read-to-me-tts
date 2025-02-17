import { TTSSettings, useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { TTSSettingsStorage } from '@extension/storage';
import AzureSettings from './providerSettings/AzureSettings';
import ElevenLabsSettings from './providerSettings/ElevenLabsSettings';
import CustomServerSettings from './providerSettings/CustomServerSettings';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@extension/ui/lib/components/cn/select';
import { Card } from '@extension/ui/lib/components/cn/card';
const Options = () => {
  const settingsStorage = useStorage(TTSSettingsStorage);

  return (
    <div className={`w-screen h-screen flex flex-col items-center justify-center`}>
      <Card className="w-1/2 h-1/2 p-4">
        <div className="flex flex-col gap-4">
          <Select
            value={settingsStorage?.ttsProvider}
            onValueChange={value =>
              TTSSettingsStorage.set({
                ...settingsStorage,
                ttsProvider: value as TTSSettings['ttsProvider'],
              })
            }>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a TTS Provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>TTS Provider</SelectLabel>
                {settingsStorage?.ttsProviders?.map(provider => (
                  <SelectItem key={provider} value={provider}>
                    {provider}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {settingsStorage?.ttsProvider === 'azure' && <AzureSettings />}
          {settingsStorage?.ttsProvider === 'elevenlabs' && <ElevenLabsSettings />}
          {settingsStorage?.ttsProvider === 'customServer' && <CustomServerSettings />}
        </div>
      </Card>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Options, <div> Loading ... </div>), <div> Error Occur </div>);
