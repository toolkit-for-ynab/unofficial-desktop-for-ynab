const fs = require('fs');
const http = require('http');
const path = require('path');
const yauzl = require('yauzl');

const ElectronSettings = require('electron-settings');
let settings = new ElectronSettings();

const toolkitPath = path.join(settings.getConfigFilePath(), '..', '..', 'toolkit');

class ToolkitHelper {
  activateIfNeeded(mainWindow) {
    //if (settings.get('toolkit-enabled')) {
      if (!this.toolkitInstalled()) {
        this.installToolkit()
          .then(() => {
            this.activateToolkit(mainWindow);
          })
      } else {
        this.activateToolkit(mainWindow);
      }
    //}
  }

  toolkitInstalled() {
    try {
      return fs.statSync(path.join(toolkitPath, 'main.js'));
    } catch (err) {
      // File doesn't exist.
      return false;
    }
  }

  installToolkit() {
    this.downloadFile('http://toolkitforynab.com/desktop-updates/toolkitforynab_desktop.zip', path.join(toolkitPath, '..', 'toolkit.zip'))
      .then(() => {
        return this.unzipFile(path.join(toolkitPath, '..', 'toolkitforynab_desktop.zip'));
      })
      .then(() => {
        console.log('done!');
      });
  }

  activateToolkit(app) {

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

  unzipFile(path) {
    debugger;
    return new Promise((resolve, reject) => {
      try {
        yauzl.open(path, { autoClose: true, lazyEntries: true }, (err, zipfile) => {
          if (err) throw err;
          zipfile.readEntry();
          zipfile.on('entry', function(entry) {
            if (entry.fileName.endsWith('/')) {
              // directory file names end with '/'
              mkdirp(entry.fileName, function(err) {
                if (err) throw err;
                zipfile.readEntry();
              });
            } else {
              // file entry
              zipfile.openReadStream(entry, function(err, readStream) {
                if (err) throw err;
                // ensure parent directory exists
                mkdirp(path.dirname(entry.fileName), function(err) {
                  if (err) throw err;
                  readStream.pipe(fs.createWriteStream(entry.fileName));
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
