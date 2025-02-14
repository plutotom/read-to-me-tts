export const initializeCustomServerSettings = () => {
  const createParamRow = (containerId, keyValue = { key: "", value: "" }) => {
    const row = document.createElement("div");
    row.className = "param-row";

    const keyInput = document.createElement("input");
    keyInput.type = "text";
    keyInput.placeholder = "Key";
    keyInput.value = keyValue.key;
    keyInput.className = "param-key";

    const valueInput = document.createElement("input");
    valueInput.type = "text";
    valueInput.placeholder = "Value";
    valueInput.value = keyValue.value;
    valueInput.className = "param-value";

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "remove-row-btn";
    removeBtn.textContent = "×";
    removeBtn.onclick = () => row.remove();

    row.appendChild(keyInput);
    row.appendChild(valueInput);
    row.appendChild(removeBtn);

    document.getElementById(containerId).appendChild(row);
  };

  const setupCustomServerControls = () => {
    document.getElementById("addHeaderBtn").onclick = () => {
      createParamRow("headersList");
    };

    document.getElementById("addBodyParamBtn").onclick = () => {
      createParamRow("bodyParamsList");
    };
  };

  const loadSavedParams = async () => {
    const settings = await chrome.storage.sync.get([
      "customServerHeaders",
      "customServerBodyParams",
      "customServerTextKey",
    ]);

    if (settings.customServerHeaders) {
      settings.customServerHeaders.forEach((header) => {
        createParamRow("headersList", header);
      });
    }

    if (settings.customServerBodyParams) {
      settings.customServerBodyParams.forEach((param) => {
        createParamRow("bodyParamsList", param);
      });
    }

    if (settings.customServerTextKey) {
      document.getElementById("customServerTextKey").value =
        settings.customServerTextKey;
    }
  };

  setupCustomServerControls();
  loadSavedParams();

  return {
    getCustomServerConfig: () => {
      const headers = Array.from(
        document.querySelectorAll("#headersList .param-row")
      ).map((row) => ({
        key: row.querySelector(".param-key").value,
        value: row.querySelector(".param-value").value,
      }));

      const bodyParams = Array.from(
        document.querySelectorAll("#bodyParamsList .param-row")
      ).map((row) => ({
        key: row.querySelector(".param-key").value,
        value: row.querySelector(".param-value").value,
      }));

      const textKey =
        document.getElementById("customServerTextKey").value || "text";

      return {
        headers,
        bodyParams,
        textKey,
      };
    },
  };
};
