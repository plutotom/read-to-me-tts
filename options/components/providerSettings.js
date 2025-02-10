export const initializeProviderSettings = () => {
  function toggleProviderSettings(provider) {
    document.querySelectorAll(".provider-settings").forEach((div) => {
      div.style.display = "none";
    });

    const settingsDiv = document.getElementById(`${provider}Settings`);
    if (settingsDiv) {
      settingsDiv.style.display = "block";
    }
  }

  // Set up provider change listener
  document.getElementById("ttsProvider").addEventListener("change", (e) => {
    toggleProviderSettings(e.target.value);
  });

  return { toggleProviderSettings };
};
