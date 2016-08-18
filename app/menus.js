const electron = require('electron');
const Menu = electron.Menu;
const MenuItem = electron.MenuItem;

const SettingsHelper = require('./settings-helper');
const settingsHelper = new SettingsHelper();

const ToolkitHelper = require('./toolkit-helper');

class MenuHelper {
  static getTemplate() {
    let template = [
      {
        label: 'Edit',
        submenu: [
          {
            role: 'undo'
          },
          {
            role: 'redo'
          },
          {
            type: 'separator'
          },
          {
            role: 'cut'
          },
          {
            role: 'copy'
          },
          {
            role: 'paste'
          },
          {
            role: 'pasteandmatchstyle'
          },
          {
            role: 'delete'
          },
          {
            role: 'selectall'
          },
        ]
      },
      {
        label: 'Toolkit',
        submenu: [
          {
            label: 'Enable Toolkit for YNAB',
            type: 'checkbox',
            checked: settingsHelper.toolkitEnabled,
            click(item, focusedWindow) {
              settingsHelper.toolkitEnabled = !settingsHelper.toolkitEnabled;
            }
          },
          {
            type: 'separator'
          },
          {
            label: settingsHelper.toolkitEnabled ? 'Using Toolkit for YNAB v' + settingsHelper.installedToolkitVersion : 'Toolkit not enabled',
            enabled: false
          },
          {
            label: 'Open Toolkit for YNAB Settings...',
            enabled: settingsHelper.toolkitEnabled && !settingsHelper.updatingToolkit,
            accelerator: process.platform === 'darwin' ? 'Cmd+,' : 'Ctrl+T',
            click(item, focusedWindow) {
              ToolkitHelper.showSettingsPage();
            }
          },
          {
            label: settingsHelper.updatingToolkit ? 'Checking for updates...' : 'Check for Toolkit Updates',
            enabled: settingsHelper.toolkitEnabled && !settingsHelper.updatingToolkit,
            click(item, focusedWindow) {
              settingsHelper.updatingToolkit = true;
            }
          }
        ]
      },
      {
        label: 'View',
        submenu: [
          {
            label: 'Reload',
            accelerator: 'CmdOrCtrl+R',
            click(item, focusedWindow) {
              if (focusedWindow) focusedWindow.reload();
            }
          },
          {
            role: 'togglefullscreen'
          },
        ]
      },
      {
        role: 'window',
        submenu: [
          {
            role: 'minimize'
          },
          {
            role: 'close'
          },
        ]
      },
      {
        role: 'help',
        submenu: [
          {
            label: 'Learn More',
            click() { electron.shell.openExternal('https://github.com/toolkit-for-ynab/unofficial-desktop-for-ynab'); }
          },
        ]
      },
    ];

    if (process.platform === 'darwin') {
      template.unshift({
        label: electron.app.getName(),
        submenu: [
          {
            role: 'about'
          },
          {
            type: 'separator'
          },
          {
            role: 'services',
            submenu: []
          },
          {
            type: 'separator'
          },
          {
            role: 'hide'
          },
          {
            role: 'hideothers'
          },
          {
            role: 'unhide'
          },
          {
            type: 'separator'
          },
          {
            role: 'quit'
          },
        ]
      });

      // Window menu.
      template[4].submenu = [
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          role: 'close'
        },
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        },
        {
          label: 'Zoom',
          role: 'zoom'
        },
        {
          type: 'separator'
        },
        {
          label: 'Bring All to Front',
          role: 'front'
        }
      ];
    }

    return template;
  }

  // Changes to toolkit settings or versions should reflect in the menu.
  static recreateMenu() {
    var settingsResult = settingsHelper.toolkitEnabled && !settingsHelper.updatingToolkit;
    debugger;

    // Need to recreate the entire menu. See https://github.com/electron/electron/issues/528
    let menu = Menu.buildFromTemplate(MenuHelper.getTemplate());
    Menu.setApplicationMenu(menu);
  }
}

MenuHelper.recreateMenu();

settingsHelper.observeToolkitEnabled(MenuHelper.recreateMenu);
settingsHelper.observeToolkitInstalledVersion(MenuHelper.recreateMenu);
settingsHelper.observeUpdatingToolkit(MenuHelper.recreateMenu);
