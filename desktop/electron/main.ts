import { app, BrowserWindow } from 'electron';
import path from 'node:path';

function createWindow() {
  const window = new BrowserWindow({
    width: 1300,
    height: 850,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  window.loadURL(process.env.VITE_DEV_SERVER_URL || `file://${path.join(__dirname, '../dist/index.html')}`);
}

app.whenReady().then(createWindow);
