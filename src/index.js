const { app, BrowserWindow, Menu } = require("electron");
const { ipcMain } = require("electron/main");
const path = require("path");
const https = require("https");

// ===========================<<<<<!!!IMPORTANT!!!>>>>>==========================

// 1. DO NOT ENABLE NODE INTEGRATION
// 2. ENABLE CONTEXT ISOLATION
// 3. DEFINE CONTENT SECURITY POLICY IN HTML
// 4. VALIDATE USER INPUT

// ==============================================================================

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

let win;
let aboutWin;

const template = [
  {
    label: "File",
    submenu: [
      {
        label: "Exit",
        accelerator: "Ctrl+Q",
        click: () => {
          app.quit();
        },
      },
    ],
  },
  {
    label: "Help",
    submenu: [
      {
        label: "About",
        accelerator: "F12",
        click: () => {
          createAboutWindow();
        },
      },
    ],
  },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

const createWindow = () => {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1366,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: false,
      nodeIntegration: true,
    },
  });
  // and load the index.html of the app.
  win.loadFile(path.join(__dirname, "index.html"));

  win.on("ready-to-show", () => {
    win.show();
  });

  win.webContents.on("crashed", (e) => {
    app.relaunch();
  });
  // Open the DevTools.
  win.webContents.openDevTools();
};

const createAboutWindow = () => {
  if (!aboutWin) {
    aboutWin = new BrowserWindow({
      width: 600,
      height: 600,
      autoHideMenuBar: true,
      webPreferences: {
        // preload: path.join(__dirname, "preload.js"),
        contextIsolation: false,
        nodeIntegration: true,
      },
    });
  }

  // and load the index.html of the app.
  aboutWin.loadFile(path.join(__dirname, "about.html"));
  aboutWin.on("closed", () => {
    aboutWin = null;
  });
  aboutWin.on("ready-to-show", () => {
    aboutWin.show();
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.on("makeRequest", (e, url) => {
  console.log("URL to fetch: " + url);
  if (!url) {
    console.log("Error, requested URL does not exist.");
  }
  https
    .get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        console.log(data);
        e.sender.send("response", "html contents of the response:" + data);
      });
    })
    .on("error", (err) => {
      console.log(err.message);
    });
});
