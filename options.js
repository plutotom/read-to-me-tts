document.addEventListener("DOMContentLoaded", () => {
  // Function to toggle the display of settings based on selected provider.
  function toggleProviderSettings(provider) {
    document.querySelectorAll(".provider-settings").forEach((div) => {
      div.style.display = "none";
    });
    if (provider === "azure") {
      document.getElementById("azureSettings").style.display = "block";
    } else if (provider === "elevenlabs") {
      document.getElementById("elevenlabsSettings").style.display = "block";
    }
    // Additional providers can be toggled here as needed.
  }

  // Load saved settings.
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
      if (settings.ttsProvider) {
        document.getElementById("ttsProvider").value = settings.ttsProvider;
        toggleProviderSettings(settings.ttsProvider);
      } else {
        // Default to Azure.
        toggleProviderSettings("azure");
      }
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
      // For ElevenLabs voice and model, they will be selected after the options are loaded.
    }
  );

  // Update UI when the provider selection changes.
  document.getElementById("ttsProvider").addEventListener("change", (e) => {
    toggleProviderSettings(e.target.value);
  });

  // Populate static model dropdown for ElevenLabs.
  const models = [
    { id: "eleven_monolingual_v1", name: "Monolingual (Standard)" },
    { id: "eleven_multilingual_v1", name: "Multilingual (Enhanced)" },
  ];
  const modelDropdown = document.getElementById("elevenlabsModelDropdown");
  modelDropdown.innerHTML = ""; // Clear any existing options.
  models.forEach((model) => {
    const option = document.createElement("option");
    option.value = model.id;
    option.textContent = model.name;
    modelDropdown.appendChild(option);
  });
  // If a stored model value exists, select it.
  chrome.storage.sync.get(["elevenlabsModel"], (stored) => {
    if (stored.elevenlabsModel) {
      modelDropdown.value = stored.elevenlabsModel;
    }
  });

  // Load voices for ElevenLabs when the button is clicked.
  document
    .getElementById("loadElevenLabsVoices")
    .addEventListener("click", () => {
      const apiKey = document.getElementById("elevenlabsApiKey").value.trim();
      if (!apiKey) {
        alert("Please enter your ElevenLabs API Key first.");
        return;
      }
      fetch("https://api.elevenlabs.io/v1/voices", {
        method: "GET",
        headers: {
          "xi-api-key": apiKey,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              "Failed to load voices from ElevenLabs. Check your API key."
            );
          }
          return response.json();
        })
        .then((data) => {
          const voiceDropdown = document.getElementById(
            "elevenlabsVoiceDropdown"
          );
          voiceDropdown.innerHTML = ""; // Clear previous options.
          if (data.voices && Array.isArray(data.voices)) {
            data.voices.forEach((voice) => {
              const option = document.createElement("option");
              option.value = voice.voice_id; // assuming each voice has a voice_id property
              option.textContent = voice.name;
              voiceDropdown.appendChild(option);
            });
            // Optionally select a stored voice if available.
            chrome.storage.sync.get(["elevenlabsVoiceId"], (stored) => {
              if (stored.elevenlabsVoiceId) {
                voiceDropdown.value = stored.elevenlabsVoiceId;
              }
            });
          } else {
            alert("No voices found.");
          }
        })
        .catch((error) => {
          alert("Error: " + error.message);
        });
    });

  // Save settings when the form is submitted.
  document.getElementById("optionsForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const ttsProvider = document.getElementById("ttsProvider").value;
    const azureSubscriptionKey = document.getElementById(
      "azureSubscriptionKey"
    ).value;
    const azureRegion = document.getElementById("azureRegion").value;
    const azureVoice = document.getElementById("azureVoice").value;
    const elevenlabsApiKey = document.getElementById("elevenlabsApiKey").value;
    const elevenlabsVoiceId = document.getElementById(
      "elevenlabsVoiceDropdown"
    ).value;
    const elevenlabsModel = document.getElementById(
      "elevenlabsModelDropdown"
    ).value;
    chrome.storage.sync.set(
      {
        ttsProvider,
        azureSubscriptionKey,
        azureRegion,
        azureVoice,
        elevenlabsApiKey,
        elevenlabsVoiceId,
        elevenlabsModel,
      },
      () => {
        alert("Settings saved.");
      }
    );
  });
});
