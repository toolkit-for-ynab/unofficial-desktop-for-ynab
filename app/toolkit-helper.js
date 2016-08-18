const {BrowserWindow} = require('electron');
const fs = require('fs');
const http = require('http');
const mkdirp = require('mkdirp');
const path = require('path');
const rimraf = require('rimraf');
const yauzl = require('yauzl');

const SettingsHelper = require('./settings-helper');
const settingsHelper = new SettingsHelper();

const StatusDisplay = require('./status-display');

const toolkitPath = settingsHelper.toolkitPath;
const toolkitStagingPath = settingsHelper.toolkitStagingPath;

class ToolkitHelper {
  static showSettingsPage() {
    let win = new BrowserWindow({width: 800, height: 600});

    win.on('closed', () => {
      win = null
    });

    win.loadURL('file://' + path.join(toolkitPath, 'options.html'));
  }

  activateIfNeeded() {
    if (settingsHelper.toolkitEnabled) {
      if (!this.toolkitInstalled()) {
        this.installLatestToolkit()
          .then(() => {
            this.activateToolkit();
          })
      } else {
        this.activateToolkit();
      }
    }

    settingsHelper.observeToolkitEnabled((newValue) => {
      if (newValue) {
        this.activateIfNeeded();
      }
    });
  }

  toolkitInstalled() {
    try {
      return fs.statSync(path.join(toolkitPath, 'main.js'));
    } catch (err) {
      // File doesn't exist.
      return false;
    }
  }

  installLatestToolkit() {
    StatusDisplay.showMessage('Downloading Toolkit...');

    settingsHelper.updatingToolkit = true;

    let destination = path.join(toolkitPath, '..', 'toolkit.zip');

    // Steps:
    // 1. Download the zip file from our website
    // 2. Unzip it into our settings directory/toolkit
    // This serves as a staging directory so we can move the other one into place
    // 3. Delete the zip file as we no longer need it
    // 4. Delete the old toolkit directory in toolkit-installed
    // 5. Rename toolkit directory to toolkit-installed
    // 6. Read manifest file to determine version. Save in settings for easy retrieval
    return new Promise((resolve, reject) => {
      this.downloadFile('http://toolkitforynab.com/desktop-updates/toolkitforynab_desktop.zip', destination)
      .then(() => {
        StatusDisplay.showMessage('Installing Toolkit...');

        return this.unzipFile(destination);
      })
      .then(() => {
        return this.deleteRecursively(path.join(toolkitPath, '..', 'toolkit.zip'))
      })
      .then(() => {
        return this.deleteRecursively(toolkitPath);
      })
      .then(() => {
        return this.renameFolder(toolkitStagingPath, toolkitPath);
      })
      .then(() => {
        return this.saveToolkitVersionFromManifestInSettings();
      })
      .then(() => {
        StatusDisplay.finished();

        settingsHelper.updatingToolkit = false;

        resolve();
      });
    });
  }

  activateToolkit() {

  }

  deleteRecursively(path) {
    return new Promise((resolve, reject) => {
      // rm -rf = rimraf
      rimraf(path, (err) => {
        if (err) reject(err);

        resolve();
      });
    });
  }

  renameFolder(oldName, newName) {
    return new Promise((resolve, reject) => {
      fs.rename(oldName, newName, (err) => {
        if (err) reject(err);

        resolve();
      });
    });
  }

  saveToolkitVersionFromManifestInSettings() {
    return new Promise((resolve, reject) => {
      fs.readFile(path.join(toolkitPath, 'manifest.json'), 'utf8', function (err, data) {
        if (err) reject(err);

        let manifest = JSON.parse(data);

        settingsHelper.installedToolkitVersion = manifest.version;

        resolve();
      });
    });
  }

  downloadFile(url, destination) {
    return new Promise((resolve, reject) => {
      var file = fs.createWriteStream(destination);
      var request = http.get(url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
          file.close(resolve);
        });
      }).on('error', function(err) {
        fs.unlink(destination);
        reject(err);
      });
    });
  }

  unzipFile(file) {
    let destination = path.join(file, '..', path.basename(file, '.zip'));

    return new Promise((resolve, reject) => {
      try {
        yauzl.open(file, { autoClose: true, lazyEntries: true }, (err, zipfile) => {
          if (err) throw err;
          zipfile.readEntry();
          zipfile.on('entry', function(entry) {
            if (entry.fileName.endsWith('/')) {
              // directory file names end with '/'
              mkdirp(path.join(destination, entry.fileName), function(err) {
                if (err) throw err;
                zipfile.readEntry();
              });
            } else {
              // file entry
              zipfile.openReadStream(entry, function(err, readStream) {
                if (err) throw err;
                // ensure parent directory exists
                mkdirp(path.join(destination, path.dirname(entry.fileName)), function(err) {
                  if (err) throw err;
                  readStream.pipe(fs.createWriteStream(path.join(destination, entry.fileName)));
                  readStream.on('end', function() {
                    zipfile.readEntry();
                  });
                });
              });
            }
          });
          zipfile.on('end', function() {
            // Successfully unzipped.
            resolve();
          })
        });
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = ToolkitHelper;
