import 'webextension-polyfill';
import { exampleThemeStorage, TTSSettingsStorage } from '@extension/storage';
import { arrayBufferToBase64 } from '@extension/shared/lib/utils';
import { TTSSettings, CustomHeader, CustomBodyParam } from '@extension/shared/lib/utils/shared-types';
exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});

console.log('background loaded');
console.log("Edit 'chrome-extension/src/background/index.ts' and save to reload.");

console.log('TTSSettingsStorage', TTSSettingsStorage);

// Create the context menu when the extension is installed.
chrome.runtime.onInstalled.addListener(() => {
  if (chrome.contextMenus) {
    chrome.contextMenus.create({
      id: 'read-to-me',
      title: 'Read to me',
      contexts: ['selection'],
    });
  } else {
    console.error('contextMenus API not available');
  }
});

// Listen for clicks on the context menu.
chrome.contextMenus.onClicked.addListener((info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => {
  if (info.menuItemId === 'read-to-me' && info.selectionText && tab?.id) {
    const text = info.selectionText;

    // Get all TTS-related settings with typed callback
    chrome.storage.sync.get(
      [
        'ttsProvider',
        'azureSubscriptionKey',
        'azureRegion',
        'azureVoice',
        'elevenlabsApiKey',
        'elevenlabsVoiceId',
        'elevenlabsModel',
        'customServerEndpoint',
        'customServerApiKey',
        'customServerHeaders',
        'customServerBodyParams',
        'customServerTextKey',
      ],
      (settings: TTSSettings) => {
        const ttsProvider = settings.ttsProvider || 'azure';

        if (ttsProvider === 'azure') {
          // (Existing Azure integration – unchanged)
          const { azureSubscriptionKey, azureRegion, azureVoice } = settings;
          if (!azureSubscriptionKey || !azureRegion) {
            chrome.tabs.sendMessage(tab?.id || 0, {
              action: 'error',
              message: 'Azure credentials are not set. Please set them in the options page.',
            });
            return;
          }
          const voiceName = azureVoice || 'en-US-JessaNeural';
          const tokenUrl = `https://${azureRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;
          fetch(tokenUrl, {
            method: 'POST',
            headers: {
              'Ocp-Apim-Subscription-Key': azureSubscriptionKey,
            },
          })
            .then(response => {
              if (!response.ok) {
                throw new Error('Failed to retrieve Azure token');
              }
              return response.text();
            })
            .then(token => {
              const ssml = `<speak version="1.0" xml:lang="en-US">
    <voice xml:lang="en-US" xml:gender="Female" name="${voiceName}">
      ${text}
    </voice>
  </speak>`;
              const ttsUrl = `https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`;
              return fetch(ttsUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/ssml+xml',
                  'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3',
                  Authorization: 'Bearer ' + token,
                },
                body: ssml,
              });
            })
            .then(response => {
              if (!response.ok) {
                throw new Error('Azure TTS request failed');
              }
              return response.arrayBuffer();
            })
            .then(arrayBuffer => {
              const base64String = arrayBufferToBase64(arrayBuffer);
              // Check if tab still exists before sending message
              chrome.tabs.get(tab?.id || 0, function (currentTab) {
                if (chrome.runtime.lastError || !currentTab) {
                  console.error('Tab no longer exists');
                  return;
                }

                // Verify the tab is in a state where we can inject content scripts
                if (!currentTab.url?.startsWith('chrome://') && !currentTab.url?.startsWith('edge://')) {
                  chrome.tabs.sendMessage(
                    tab?.id || 0,
                    {
                      action: 'playAudio',
                      audioData: base64String,
                      mimeType: 'audio/mpeg',
                    },
                    response => {
                      if (chrome.runtime.lastError) {
                        // If content script isn't ready, inject it and try again
                        chrome.scripting.executeScript(
                          {
                            target: { tabId: tab?.id || 0 },
                            files: ['content.js'],
                          },
                          () => {
                            // Retry sending the message after script injection
                            chrome.tabs.sendMessage(tab?.id || 0, {
                              action: 'playAudio',
                              audioData: base64String,
                              mimeType: 'audio/mpeg',
                            });
                          },
                        );
                      }
                    },
                  );
                }
              });
            })
            .catch(error => {
              console.error('Error:', error);
              // Only try to send error message if we can verify the tab exists
              chrome.tabs.get(tab?.id || 0, function (currentTab) {
                if (!chrome.runtime.lastError && currentTab) {
                  chrome.tabs.sendMessage(tab?.id || 0, {
                    action: 'error',
                    message: error.message,
                  });
                }
              });
            });
        } else if (ttsProvider === 'elevenlabs') {
          // ElevenLabs TTS integration.
          const { elevenlabsApiKey, elevenlabsVoiceId, elevenlabsModel } = settings;
          if (!elevenlabsApiKey || !elevenlabsVoiceId || !elevenlabsModel) {
            chrome.tabs.sendMessage(tab?.id || 0, {
              action: 'error',
              message: 'ElevenLabs credentials or selections are not set. Please set them in the options page.',
            });
            return;
          }
          // ElevenLabs TTS endpoint.
          const ttsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${elevenlabsVoiceId}`;
          fetch(ttsUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'audio/mpeg',
              'xi-api-key': elevenlabsApiKey,
            },
            body: JSON.stringify({ text: text, model_id: elevenlabsModel }),
          })
            .then(response => {
              if (!response.ok) {
                throw new Error('ElevenLabs TTS request failed');
              }
              return response.arrayBuffer();
            })
            .then(arrayBuffer => {
              const base64String = arrayBufferToBase64(arrayBuffer);
              // Check if tab still exists before sending message
              chrome.tabs.get(tab?.id || 0, function (currentTab) {
                if (chrome.runtime.lastError || !currentTab) {
                  console.error('Tab no longer exists');
                  return;
                }

                // Verify the tab is in a state where we can inject content scripts
                if (!currentTab.url?.startsWith('chrome://') && !currentTab.url?.startsWith('edge://')) {
                  chrome.tabs.sendMessage(
                    tab?.id || 0,
                    {
                      action: 'playAudio',
                      audioData: base64String,
                      mimeType: 'audio/mpeg',
                    },
                    response => {
                      if (chrome.runtime.lastError) {
                        // If content script isn't ready, inject it and try again
                        chrome.scripting.executeScript(
                          {
                            target: { tabId: tab?.id || 0 },
                            files: ['content.js'],
                          },
                          () => {
                            // Retry sending the message after script injection
                            chrome.tabs.sendMessage(tab?.id || 0, {
                              action: 'playAudio',
                              audioData: base64String,
                              mimeType: 'audio/mpeg',
                            });
                          },
                        );
                      }
                    },
                  );
                }
              });
            })
            .catch(error => {
              console.error('Error:', error);
              // Only try to send error message if we can verify the tab exists
              chrome.tabs.get(tab?.id || 0, function (currentTab) {
                if (!chrome.runtime.lastError && currentTab) {
                  chrome.tabs.sendMessage(tab?.id || 0, {
                    action: 'error',
                    message: error.message,
                  });
                }
              });
            });
        } else if (ttsProvider === 'customServer') {
          const {
            customServerEndpoint,
            customServerHeaders = [] as CustomHeader[],
            customServerBodyParams = [] as CustomBodyParam[],
            customServerTextKey = 'text',
          } = settings;

          if (!customServerEndpoint) {
            chrome.tabs.sendMessage(tab?.id || 0, {
              action: 'error',
              message: 'Custom server endpoint is not configured.',
            });
            return;
          }

          // Build headers object
          const headers = {
            'Content-Type': 'application/json',
          };
          customServerHeaders.forEach(header => {
            if (header.key && header.value) {
              headers[header.key as keyof typeof headers] = header.value;
            }
          });

          // Build body object
          const body: Record<string, string> = {};
          customServerBodyParams.forEach(param => {
            if (param.key && param.value) {
              body[param.key] = param.value.replace('{text}', text);
            }
          });
          // Add the text with the custom key
          body[customServerTextKey] = text;

          console.log(headers);
          console.log(body);
          fetch(customServerEndpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body),
          })
            .then(response => {
              if (!response.ok) {
                throw new Error('Custom TTS server request failed: ' + response.statusText);
              }

              return new Response(
                new ReadableStream({
                  async start(controller) {
                    const reader = response.body?.getReader();

                    while (true) {
                      if (!reader) {
                        controller.close();
                        break;
                      }
                      const { done, value } = await reader.read();
                      if (done) {
                        controller.close();
                        break;
                      }
                      controller.enqueue(value);
                    }
                  },
                }),
              ).blob();
            })
            .then(blob => {
              return blob.arrayBuffer();
            })
            .then(arrayBuffer => {
              const base64String = arrayBufferToBase64(arrayBuffer);
              // Check if tab still exists before sending message
              chrome.tabs.get(tab?.id || 0, function (currentTab) {
                if (chrome.runtime.lastError || !currentTab) {
                  console.error('Tab no longer exists');
                  return;
                }

                // First check if content script is already injected
                chrome.tabs.sendMessage(tab?.id || 0, { action: 'ping' }, response => {
                  if (chrome.runtime.lastError) {
                    // Content script not ready, inject it first
                    chrome.scripting.executeScript(
                      {
                        target: { tabId: tab?.id || 0 },
                        files: ['content.js'],
                      },
                      () => {
                        // Wait a moment for the script to initialize
                        setTimeout(() => {
                          chrome.tabs.sendMessage(tab?.id || 0, {
                            action: 'playAudio',
                            audioData: base64String,
                            mimeType: 'audio/mpeg',
                          });
                        }, 100);
                      },
                    );
                  } else {
                    // Content script is ready, send message directly
                    chrome.tabs.sendMessage(tab?.id || 0, {
                      action: 'playAudio',
                      audioData: base64String,
                      mimeType: 'audio/mpeg',
                    });
                  }
                });
              });
            })
            .catch(error => {
              console.error('Error:', error);
              // Only try to send error message if we can verify the tab exists
              chrome.tabs.get(tab?.id || 0, function (currentTab) {
                if (!chrome.runtime.lastError && currentTab) {
                  chrome.tabs.sendMessage(tab?.id || 0, {
                    action: 'error',
                    message: error.message,
                  });
                }
              });
            });
        } else {
          // Providers not implemented yet.
          chrome.tabs.sendMessage(tab?.id || 0, {
            action: 'error',
            message: 'Selected TTS provider is not implemented.',
          });
        }
      },
    );
  }
});
