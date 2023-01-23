const { ipcRenderer } = require("electron/renderer");

ipcRenderer.on("response", (e, value) => {
  document.getElementById("text").innerHTML = value;
});

document.getElementById("submit").addEventListener("click", () => {
  ipcRenderer.send("makeRequest", document.getElementById("url").value);
});
