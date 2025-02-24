import { initializeProviderSettings } from "./components/providerSettings.js";
import { initializeElevenLabsSettings } from "./components/elevenlabsSettings.js";
import { loadSettings, saveSettings } from "./services/storage.js";
import { initializeCustomServerSettings } from "./components/customServerSettings.js";

document.addEventListener("DOMContentLoaded", async () => {
  const { toggleProviderSettings } = initializeProviderSettings();

  // Load initial settings
  const settings = await loadSettings([
    "ttsProvider",
    "azureSubscriptionKey",
    "azureRegion",
    "azureVoice",
    "elevenlabsApiKey",
    "customServerEndpoint",
    "customServerHeaders",
    "customServerBodyParams",
    "customServerTextKey",
  ]);

  // Initialize provider selection
  if (settings.ttsProvider) {
    document.getElementById("ttsProvider").value = settings.ttsProvider;
    toggleProviderSettings(settings.ttsProvider);
  } else {
    toggleProviderSettings("azure");
  }

  // Set initial values
  if (settings.azureSubscriptionKey) {
    document.getElementById("azureSubscriptionKey").value =
      settings.azureSubscriptionKey;
  }
  if (settings.azureRegion) {
    document.getElementById("azureRegion").value = settings.azureRegion;
  }
  if (settings.azureVoice) {
    document.getElementById("azureVoice").value = settings.azureVoice;
  }
  if (settings.elevenlabsApiKey) {
    document.getElementById("elevenlabsApiKey").value =
      settings.elevenlabsApiKey;
  }
  if (settings.customServerEndpoint) {
    document.getElementById("customServerEndpoint").value =
      settings.customServerEndpoint;
  }

  // Initialize ElevenLabs components
  initializeElevenLabsSettings();

  // Initialize custom server settings
  const customServerConfig = initializeCustomServerSettings();

  // Handle form submission
  document
    .getElementById("optionsForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const { headers, bodyParams, textKey } =
        customServerConfig.getCustomServerConfig();

      const formData = {
        ttsProvider: document.getElementById("ttsProvider").value,
        azureSubscriptionKey: document.getElementById("azureSubscriptionKey")
          .value,
        azureRegion: document.getElementById("azureRegion").value,
        azureVoice: document.getElementById("azureVoice").value,
        elevenlabsApiKey: document.getElementById("elevenlabsApiKey").value,
        elevenlabsVoiceId: document.getElementById("elevenlabsVoiceDropdown")
          .value,
        elevenlabsModel: document.getElementById("elevenlabsModelDropdown")
          .value,
        customServerEndpoint: document.getElementById("customServerEndpoint")
          .value,
        customServerHeaders: headers,
        customServerBodyParams: bodyParams,
        customServerTextKey: textKey,
      };

      await saveSettings(formData);
      alert("Settings saved.");
    });
});
