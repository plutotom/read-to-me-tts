import { TTSSettings, useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { TTSSettingsStorage } from '@extension/storage';
import AzureSettings from './providerSettings/AzureSettings';
import ElevenLabsSettings from './providerSettings/ElevenLabsSettings';
import CustomServerSettings from './providerSettings/CustomServerSettings';

const Options = () => {
  const settingsStorage = useStorage(TTSSettingsStorage);

  return (
    <div className={`w-screen h-screen`}>
      <div className="flex flex-col">
        <label htmlFor="ttsProvider">TTS Provider</label>
        <select
          id="ttsProvider"
          value={settingsStorage?.ttsProvider}
          onChange={e =>
            TTSSettingsStorage.set({
              ...settingsStorage,
              ttsProvider: e.target.value as TTSSettings['ttsProvider'],
            })
          }>
          {settingsStorage?.ttsProviders?.map(provider => (
            <option key={provider} value={provider}>
              {provider}
            </option>
          ))}
        </select>

        {settingsStorage?.ttsProvider === 'azure' && <AzureSettings />}
        {settingsStorage?.ttsProvider === 'elevenlabs' && <ElevenLabsSettings />}
        {settingsStorage?.ttsProvider === 'customServer' && <CustomServerSettings />}
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Options, <div> Loading ... </div>), <div> Error Occur </div>);
