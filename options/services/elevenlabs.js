// Handle ElevenLabs API interactions

export const fetchElevenLabsVoices = async (apiKey) => {
  const response = await fetch("https://api.elevenlabs.io/v1/voices", {
    method: "GET",
    headers: {
      "xi-api-key": apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(
      "Failed to load voices from ElevenLabs. Check your API key."
    );
  }

  return response.json();
};
export const fetchElevenLabsModels = async (apiKey) => {
  console.log("fetchElevenLabsModels");

  const response = await fetch("https://api.elevenlabs.io/v1/models", {
    method: "GET",
    headers: {
      "xi-api-key": apiKey,
    },
  });

  if (!response.ok) {
    console.log("response not ok");
    throw new Error(
      "Failed to load voices from ElevenLabs. Check your API key."
    );
  }
  await console.log("response", response);

  return response.json();
};
