chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "ping") {
    sendResponse({ status: "ready" });
    return;
  }
  if (message.action === "playAudio") {
    const { audioData, mimeType } = message;
    const blob = base64ToBlob(audioData, mimeType);
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play();
  } else if (message.action === "error") {
    alert("Error: " + message.message);
  }
});

// Helper: Convert a Base64 string to a Blob.
function base64ToBlob(base64, mime) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mime });
}
