const electron = require('electron')

if (require('electron-squirrel-startup')) return;

// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const SettingsHelper = require('./settings-helper');
const settingsHelper = new SettingsHelper();

const ToolkitHelper = require('./toolkit-helper');
const toolkitHelper = new ToolkitHelper();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

app.on('will-finish-launching', () => {
  app.on('open-file', (event, path) => {
    console.log("open " + event + path);
  });
});

app.on('ready', () => {
  // Set the app menu
  require('./menus.js');

  // Create the browser window.
  mainWindow = new BrowserWindow(settingsHelper.windowSize);
  settingsHelper.attachEvents(mainWindow);

  toolkitHelper.activateIfNeeded(mainWindow);

  mainWindow.on('closed', function () {
    mainWindow = null
  })

  mainWindow.loadURL(settingsHelper.budgetUrl);
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})
