const electron = require('electron');
const Menu = electron.Menu;
const MenuItem = electron.MenuItem;

const SettingsHelper = require('./settings-helper');
const settingsHelper = new SettingsHelper();

const template = [
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
        accelerator: 'CmdOrCtrl+T',
        type: 'checkbox',
        checked: settingsHelper.toolkitEnabled,
        click(item, focusedWindow) {
          settingsHelper.toolkitEnabled = !settingsHelper.toolkitEnabled;
        }
      },
      {
        role: 'separator'
      },
      {
        label: settingsHelper.toolkitEnabled ? 'Using Toolkit for YNAB v' + settingsHelper.installedToolkitVersion : 'Toolkit not enabled',
        enabled: false
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
  const name = electron.app.getName();
  template.unshift({
    label: name,
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

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

// Changes to toolkit settings or versions should reflect in the menu.
function updateToolkitMenuItem(newValue) {
  let menu = Menu.getApplicationMenu();
  let toolkitMenu = menu.items.find(item => item.label === 'Toolkit').submenu;

  let labelText;

  if (typeof newValue === 'boolean') {
    labelText = newValue ? 'Using Toolkit for YNAB v' + settingsHelper.installedToolkitVersion : 'Toolkit not enabled';
  } else {
    labelText = settingsHelper.toolkitEnabled ? 'Using Toolkit for YNAB v' + newValue : 'Toolkit not enabled';
  }

  let newItem = new MenuItem({
    label: labelText,
    enabled: false
  });

  toolkitMenu.items.length--;
  toolkitMenu.items.push(newItem);
}

settingsHelper.observeToolkitEnabled(updateToolkitMenuItem);
settingsHelper.observeToolkitInstalledVersion(updateToolkitMenuItem);
