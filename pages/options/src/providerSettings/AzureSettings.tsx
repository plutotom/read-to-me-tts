import { TTSSettings, useStorage } from '@extension/shared';
import { TTSSettingsStorage } from '@extension/storage';
import { useEffect, useState } from 'react';
import { Input } from '@extension/ui/lib/components/cn/input';
import { Label } from '@extension/ui/lib/components/cn/label';
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
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl ">
        {settings?.ttsProvider
          ?.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ')}
      </h1>
      <div className="flex flex-col gap-2">
        <Label htmlFor="azureSubscriptionKey">Azure Subscription Key</Label>
        <Input
          id="azureSubscriptionKey"
          value={tempSettings.azureSubscriptionKey}
          onChange={e => handleChange(e, 'azureSubscriptionKey')}
          onBlur={handleSave}
        />
        <Label htmlFor="azureRegion">Azure Region</Label>
        <Input
          id="azureRegion"
          value={tempSettings.azureRegion}
          onChange={e => handleChange(e, 'azureRegion')}
          onBlur={handleSave}
        />
        <Label htmlFor="azureVoice">Azure Voice</Label>
        <Input
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
