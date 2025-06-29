const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: { nodeIntegration: false }
  });
  win.loadFile(path.join(__dirname, 'frontend/dist/index.html'));
}

app.whenReady().then(() => {
  // When packaged, add the copied backend node_modules to the path
  if (app.isPackaged) {
    module.paths.push(path.resolve(process.resourcesPath, 'node_modules'));
  }

  // Start backend directly in the main process
  try {
    console.log('Starting backend...');
    require(path.join(__dirname, 'backend', 'index.js'));
    console.log('Backend started successfully');
  } catch (error) {
    console.error('Failed to start backend:', error);
  }

  createWindow();
});
