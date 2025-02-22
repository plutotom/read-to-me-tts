import { TTSSettings, CustomHeader, CustomBodyParam, useStorage } from '@extension/shared';
import { TTSSettingsStorage } from '@extension/storage';
import { useState } from 'react';
import { Input } from '@extension/ui/lib/components/cn/input';
import { Label } from '@extension/ui/lib/components/cn/label';
import { Button } from '@extension/ui/lib/components/cn/button';
import { Alert, AlertDescription, AlertTitle } from '@extension/ui/lib/components/cn/alert';
import { Plus, Trash } from 'lucide-react';

const CustomServerSettings = () => {
  const settings = useStorage(TTSSettingsStorage);
  const [error, setError] = useState<string | null>(null);

  const addHeader = () => {
    TTSSettingsStorage.set(prev => ({
      ...prev,
      customServerHeaders: [...(prev.customServerHeaders || []), { key: '', value: '' }],
    }));
  };

  const addBodyParam = () => {
    TTSSettingsStorage.set(prev => ({
      ...prev,
      customServerBodyParams: [...(prev.customServerBodyParams || []), { key: '', value: '' }],
    }));
  };

  const removeHeader = (index: number) => {
    TTSSettingsStorage.set(prev => ({
      ...prev,
      customServerHeaders: prev.customServerHeaders?.filter((_, i) => i !== index),
    }));
  };

  const removeBodyParam = (index: number) => {
    TTSSettingsStorage.set(prev => ({
      ...prev,
      customServerBodyParams: prev.customServerBodyParams?.filter((_, i) => i !== index),
    }));
  };

  return (
    <div>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">Custom Server</h1>
      <div className="flex flex-col gap-4">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div>
          <Label htmlFor="customServerEndpoint">Server Endpoint</Label>
          <Input
            id="customServerEndpoint"
            value={settings.customServerEndpoint}
            onChange={e => {
              TTSSettingsStorage.set(prev => ({
                ...prev,
                customServerEndpoint: e.target.value,
              }));
            }}
            placeholder="https://your-tts-server.com/api/tts"
          />
        </div>

        <div>
          <Label htmlFor="customServerApiKey">API Key</Label>
          <Input
            id="customServerApiKey"
            type="password"
            value={settings.customServerApiKey}
            onChange={e => {
              TTSSettingsStorage.set(prev => ({
                ...prev,
                customServerApiKey: e.target.value,
              }));
            }}
            placeholder="Your API key"
          />
        </div>

        <div>
          <Label htmlFor="customServerTextKey">Text Parameter Key</Label>
          <Input
            id="customServerTextKey"
            value={settings.customServerTextKey}
            onChange={e => {
              TTSSettingsStorage.set(prev => ({
                ...prev,
                customServerTextKey: e.target.value,
              }));
            }}
            placeholder="text"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Custom Headers</Label>
            <Button variant="outline" size="sm" onClick={addHeader}>
              <Plus className="h-4 w-4 mr-2" />
              Add Header
            </Button>
          </div>
          {settings.customServerHeaders?.map((header, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Input
                placeholder="Header key"
                value={header.key}
                onChange={e => {
                  TTSSettingsStorage.set(prev => ({
                    ...prev,
                    customServerHeaders: prev.customServerHeaders?.map((h, i) =>
                      i === index ? { ...h, key: e.target.value } : h,
                    ),
                  }));
                }}
              />
              <Input
                placeholder="Header value"
                value={header.value}
                onChange={e => {
                  TTSSettingsStorage.set(prev => ({
                    ...prev,
                    customServerHeaders: prev.customServerHeaders?.map((h, i) =>
                      i === index ? { ...h, value: e.target.value } : h,
                    ),
                  }));
                }}
              />
              <Button variant="ghost" size="icon" onClick={() => removeHeader(index)}>
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Body Parameters</Label>
            <Button variant="outline" size="sm" onClick={addBodyParam}>
              <Plus className="h-4 w-4 mr-2" />
              Add Parameter
            </Button>
          </div>
          {settings.customServerBodyParams?.map((param, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Input
                placeholder="Parameter key"
                value={param.key}
                onChange={e => {
                  TTSSettingsStorage.set(prev => ({
                    ...prev,
                    customServerBodyParams: prev.customServerBodyParams?.map((p, i) =>
                      i === index ? { ...p, key: e.target.value } : p,
                    ),
                  }));
                }}
              />
              <Input
                placeholder="Parameter value"
                value={param.value}
                onChange={e => {
                  TTSSettingsStorage.set(prev => ({
                    ...prev,
                    customServerBodyParams: prev.customServerBodyParams?.map((p, i) =>
                      i === index ? { ...p, value: e.target.value } : p,
                    ),
                  }));
                }}
              />
              <Button variant="ghost" size="icon" onClick={() => removeBodyParam(index)}>
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomServerSettings;
