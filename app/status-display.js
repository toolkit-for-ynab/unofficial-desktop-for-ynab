const {app, BrowserWindow} = require('electron')

class StatusDisplay {
  static showMessage(message) {
    if (!this._statusWindow) {
      this._statusWindow = new BrowserWindow({
        width: 400,
        height: 600,
        transparent: true,
        frame: false,
        center: true,
        alwaysOnTop: true
      });

      this._statusWindow.loadURL(`file://${__dirname}/loading-screen/index.html`);
      this._statusWindow.once('ready-to-show', () => {
        this._statusWindow.webContents.send('message', message);
        this._statusWindow.show();
      });
    } else {
      this._statusWindow.webContents.send('message', message);
    }
  }

  static finished() {
    if (this._statusWindow) {
      this._statusWindow.close();
      delete this._statusWindow;
    }
  }
}

module.exports = StatusDisplay;
