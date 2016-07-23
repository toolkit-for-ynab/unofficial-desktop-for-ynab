const ElectronSettings = require('electron-settings');
let settings = new ElectronSettings();

class SettingsHelper {
  attachEvents(window) {
    // Save the last size of the window.
    window.on('resize', () => {
      this.windowSize = { width: window.getSize()[0], height: window.getSize()[1] };
    });

    // Save the budget they were last on.
    window.webContents.on('did-navigate-in-page', (event, url) => {
      var match = /([a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12})\/budget/.exec(url);
      if (match) {
        settings.set('budget-id', match[1]);
      }
    });
  }

  get windowSize() {
    var previousSize = settings.get('window-size');

    return previousSize ? previousSize : { width: 1100, height:800 };
  }

  set windowSize(size) {
    settings.set('window-size', size);
  }

  get budgetUrl() {
    let budgetUrl = 'https://app.youneedabudget.com/';

    if (settings.get('budget-id')) {
      budgetUrl += settings.get('budget-id');
    }

    return budgetUrl;
  }
}

module.exports = SettingsHelper;
