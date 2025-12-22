const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    titleBarStyle: 'hidden', // Mac-style hidden title bar for "OS" feel
    trafficLightPosition: { x: 20, y: 20 },
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // Simplifies communication for prototype
      webviewTag: true, // Enable <webview> tag
    },
    backgroundColor: '#fdfbf7', // Match Zen Paper theme
  });

  // In production, load the built index.html
  // In dev, load the Vite server
  const isDev = !app.isPackaged;
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

