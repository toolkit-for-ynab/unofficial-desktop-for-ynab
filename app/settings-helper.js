const path = require('path');
const settings = require('electron-settings');

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
        settings.setSync('budget.id', match[1]);
      }
    });
  }

  get windowSize() {
    var previousSize = settings.getSync('window-size');

    return previousSize ? previousSize : { width: 1100, height:800 };
  }

  set windowSize(size) {
    settings.setSync('window-size', size);
  }

  get budgetUrl() {
    let budgetUrl = 'https://app.youneedabudget.com/';
    let budgetId = settings.getSync('budget.id');

    if (budgetId) {
      budgetUrl += budgetId;
    }

    return budgetUrl;
  }

  get toolkitEnabled() {
    return settings.getSync('toolkit.enabled');
  }

  set toolkitEnabled(enabled) {
    settings.setSync('toolkit.enabled', enabled);
  }

  observeToolkitEnabled(callback) {
    if (!callback) throw 'A callback is required'
    
    settings.observe('toolkit.enabled', (event) => {
      callback(event.newValue);
    });
  }

  get installedToolkitVersion() {
    return settings.getSync('toolkit.installed-version');
  }

  set installedToolkitVersion(version) {
    settings.setSync('toolkit.installed-version', version);
  }

  observeToolkitInstalledVersion(callback) {
    if (!callback) throw 'A callback is required.'

    settings.observe('toolkit.installed-version', (event) => {
      callback(event.newValue);
    });
  }

  get toolkitPath() {
    return path.join(settings.getSettingsFilePath(), '..', 'toolkit-installed');
  }

  get toolkitStagingPath() {
    return path.join(settings.getSettingsFilePath(), '..', 'toolkit');
  }
}

module.exports = SettingsHelper;
