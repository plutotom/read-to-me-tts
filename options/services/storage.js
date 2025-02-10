// Handle all storage-related operations
export const saveSettings = async (settings) => {
  return new Promise((resolve) => {
    chrome.storage.sync.set(settings, () => {
      resolve();
    });
  });
};

export const loadSettings = async (keys) => {
  return new Promise((resolve) => {
    chrome.storage.sync.get(keys, (settings) => {
      resolve(settings);
    });
  });
};
