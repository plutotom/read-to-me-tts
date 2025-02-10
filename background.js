// Create the context menu when the extension is installed.
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "read-to-me",
    title: "Read to me",
    contexts: ["selection"],
  });
});

// Listen for clicks on the context menu.
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "read-to-me" && info.selectionText) {
    const text = info.selectionText;

    // Get all TTS-related settings.
    chrome.storage.sync.get(
      [
        "ttsProvider",
        "azureSubscriptionKey",
        "azureRegion",
        "azureVoice",
        "elevenlabsApiKey",
        "elevenlabsVoiceId",
        "elevenlabsModel",
      ],
      (settings) => {
        const ttsProvider = settings.ttsProvider || "azure";

        if (ttsProvider === "azure") {
          // (Existing Azure integration – unchanged)
          const { azureSubscriptionKey, azureRegion, azureVoice } = settings;
          if (!azureSubscriptionKey || !azureRegion) {
            chrome.tabs.sendMessage(tab.id, {
              action: "error",
              message:
                "Azure credentials are not set. Please set them in the options page.",
            });
            return;
          }
          const voiceName = azureVoice || "en-US-JessaNeural";
          const tokenUrl = `https://${azureRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;
          fetch(tokenUrl, {
            method: "POST",
            headers: {
              "Ocp-Apim-Subscription-Key": azureSubscriptionKey,
            },
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error("Failed to retrieve Azure token");
              }
              return response.text();
            })
            .then((token) => {
              const ssml = `<speak version="1.0" xml:lang="en-US">
    <voice xml:lang="en-US" xml:gender="Female" name="${voiceName}">
      ${text}
    </voice>
  </speak>`;
              const ttsUrl = `https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`;
              return fetch(ttsUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/ssml+xml",
                  "X-Microsoft-OutputFormat": "audio-16khz-32kbitrate-mono-mp3",
                  Authorization: "Bearer " + token,
                },
                body: ssml,
              });
            })
            .then((response) => {
              if (!response.ok) {
                throw new Error("Azure TTS request failed");
              }
              return response.arrayBuffer();
            })
            .then((arrayBuffer) => {
              const base64String = arrayBufferToBase64(arrayBuffer);
              chrome.tabs.sendMessage(tab.id, {
                action: "playAudio",
                audioData: base64String,
                mimeType: "audio/mpeg",
              });
            })
            .catch((error) => {
              chrome.tabs.sendMessage(tab.id, {
                action: "error",
                message: error.message,
              });
            });
        } else if (ttsProvider === "elevenlabs") {
          // ElevenLabs TTS integration.
          const { elevenlabsApiKey, elevenlabsVoiceId, elevenlabsModel } =
            settings;
          if (!elevenlabsApiKey || !elevenlabsVoiceId || !elevenlabsModel) {
            chrome.tabs.sendMessage(tab.id, {
              action: "error",
              message:
                "ElevenLabs credentials or selections are not set. Please set them in the options page.",
            });
            return;
          }
          // ElevenLabs TTS endpoint.
          const ttsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${elevenlabsVoiceId}`;
          fetch(ttsUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "audio/mpeg",
              "xi-api-key": elevenlabsApiKey,
            },
            body: JSON.stringify({ text: text, model_id: elevenlabsModel }),
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error("ElevenLabs TTS request failed");
              }
              return response.arrayBuffer();
            })
            .then((arrayBuffer) => {
              const base64String = arrayBufferToBase64(arrayBuffer);
              chrome.tabs.sendMessage(tab.id, {
                action: "playAudio",
                audioData: base64String,
                mimeType: "audio/mpeg",
              });
            })
            .catch((error) => {
              chrome.tabs.sendMessage(tab.id, {
                action: "error",
                message: error.message,
              });
            });
        } else {
          // Providers not implemented yet.
          chrome.tabs.sendMessage(tab.id, {
            action: "error",
            message: "Selected TTS provider is not implemented.",
          });
        }
      }
    );
  }
});

// Helper: Convert an ArrayBuffer to a Base64-encoded string.
function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
