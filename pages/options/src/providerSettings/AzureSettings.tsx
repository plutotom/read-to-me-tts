import { TTSSettings, useStorage } from '@extension/shared';
import { TTSSettingsStorage } from '@extension/storage';
import { useEffect, useState } from 'react';

const AzureSettings = () => {
  const settings = useStorage(TTSSettingsStorage);
  // Local form state
  const [tempSettings, setTempSettings] = useState<TTSSettings>(settings);

  // Handle form submission
  const handleSave = async () => {
    await TTSSettingsStorage.set(tempSettings);
  };

  useEffect(() => {
    // Store the unsubscribe function
    const unsubscribe = TTSSettingsStorage.subscribe(() => {
      // Get latest snapshot when storage changes
      const latestSettings = TTSSettingsStorage.getSnapshot();
      setTempSettings(latestSettings || {});
    });

    // Call unsubscribe function in cleanup
    return () => unsubscribe();
  }, []);
  // the above achieves the same as the below
  // useEffect(() => {
  //   setTempSettings(settings);
  // }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof TTSSettings) => {
    setTempSettings(prev => {
      return {
        ...prev,
        [key]: e.target.value,
      };
    });
  };

  return (
    <div>
      <p>{settings?.ttsProvider}</p>
      <div className="flex flex-col gap-2">
        <label htmlFor="azureSubscriptionKey">Azure Subscription Key</label>
        <input
          id="azureSubscriptionKey"
          value={tempSettings.azureSubscriptionKey}
          onChange={e => handleChange(e, 'azureSubscriptionKey')}
          onBlur={handleSave}
        />
        <label htmlFor="azureRegion">Azure Region</label>
        <input
          id="azureRegion"
          value={tempSettings.azureRegion}
          onChange={e => handleChange(e, 'azureRegion')}
          onBlur={handleSave}
        />
        <label htmlFor="azureVoice">Azure Voice</label>
        <input
          id="azureVoice"
          value={tempSettings.azureVoice}
          onChange={e => handleChange(e, 'azureVoice')}
          onBlur={handleSave}
        />
      </div>
    </div>
  );
};

export default AzureSettings;
