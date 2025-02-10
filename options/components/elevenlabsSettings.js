import {
  fetchElevenLabsVoices,
  fetchElevenLabsModels,
} from "../services/elevenlabs.js";
import { loadSettings } from "../services/storage.js";

export const initializeElevenLabsSettings = () => {
  const initializeModelDropdown = async (models) => {
    const modelDropdown = document.getElementById("elevenlabsModelDropdown");
    modelDropdown.innerHTML = "";
    models.forEach((model) => {
      const option = document.createElement("option");
      option.value = model.model_id;
      option.textContent = `${model.name} - ${model.description}`;
      modelDropdown.appendChild(option);
    });

    const stored = await loadSettings(["elevenlabsModel"]);
    if (stored.elevenlabsModel) {
      modelDropdown.value = stored.elevenlabsModel;
    }
  };

  const setupVoiceAndModelLoader = () => {
    document
      .getElementById("loadElevenLabsVoices")
      .addEventListener("click", async () => {
        const apiKey = document.getElementById("elevenlabsApiKey").value.trim();
        if (!apiKey) {
          alert("Please enter your ElevenLabs API Key first.");
          return;
        }

        try {
          // Load both voices and models in parallel
          const [voicesData, modelsData] = await Promise.all([
            fetchElevenLabsVoices(apiKey),
            fetchElevenLabsModels(apiKey),
          ]);

          // Handle voices
          const voiceDropdown = document.getElementById(
            "elevenlabsVoiceDropdown"
          );
          voiceDropdown.innerHTML = "";

          if (voicesData.voices?.length) {
            voicesData.voices.forEach((voice) => {
              const option = document.createElement("option");
              option.value = voice.voice_id;
              option.textContent = voice.name;
              voiceDropdown.appendChild(option);
            });

            const stored = await loadSettings(["elevenlabsVoiceId"]);
            if (stored.elevenlabsVoiceId) {
              voiceDropdown.value = stored.elevenlabsVoiceId;
            }
          } else {
            alert("No voices found.");
          }

          // Handle models
          if (modelsData?.length) {
            await initializeModelDropdown(modelsData);
          } else {
            alert("No models found.");
          }
        } catch (error) {
          alert("Error: " + error.message);
        }
      });
  };

  setupVoiceAndModelLoader();
};
