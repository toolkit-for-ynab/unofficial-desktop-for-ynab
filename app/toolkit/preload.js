// We're going to set up a Chrome proxy so that any calls to the Chrome API will
// just do nothing instead of causing errors.

// A few things need to know where the toolkit lives. Settings Helper can help with that.
let SettingsHelper = require('../settings-helper');
let settingsHelper = new SettingsHelper();

let chrome = () => {};

// Browser Action API
chrome.browserAction = () => {};
chrome.browserAction.onClicked = () => {};
chrome.browserAction.onClicked.addListener = () => {};
chrome.browserAction.setIcon = () => {};
chrome.browserAction.setTitle = () => {};

// Extension API
chrome.extension = () => {};
chrome.extension.getBackgroundPage = () => {
  return window;
};
chrome.extension.getURL = (fileName) => {
  return `file://${settingsHelper.toolkitPath}/${fileName}`;
}

// Notifications API
chrome.notifications = () => {};
chrome.notifications.onClicked = () => {};
chrome.notifications.onClicked.addListener = () => {};

// Runtime API
chrome.runtime = () => {};
chrome.runtime.onMessage = () => {};
chrome.runtime.onMessage.addListener = () => {};
chrome.runtime.onUpdateAvailable = () => {};
chrome.runtime.onUpdateAvailable.addListener = () => {};

// Tabs API
chrome.tabs = () => {};
chrome.tabs.onActivated = () => {};
chrome.tabs.onActivated.addListener = () => {};
chrome.tabs.onCreated = () => {};
chrome.tabs.onCreated.addListener = () => {};
chrome.tabs.onRemoved = () => {};
chrome.tabs.onRemoved.addListener = () => {};

// Web Navigation API
chrome.webNavigation = () => {};
chrome.webNavigation.onBeforeNavigate = () => {};
chrome.webNavigation.onBeforeNavigate.addListener = () => {};
chrome.webNavigation.onCompleted = () => {};
chrome.webNavigation.onCompleted.addListener = () => {};

// Windows API
chrome.windows = () => {};
chrome.windows.onFocusChanged = () => {};
chrome.windows.onFocusChanged.addListener = () => {};

window.chrome = chrome;

function getFileText(path) {
  let xhr = new XMLHttpRequest();
  xhr.open('get', `file://${settingsHelper.toolkitPath}/${path}`, false);
  xhr.send();
  if (xhr.status === 200) {
    return xhr.responseText;
  } else {
    throw 'Received something other than 200 from xhr on getFileText.';
  }
}

// Ok, now we can access the script and run it so _kangoLoader is in scope.
function requireKangoFile(path, additionalScript) {
  if (!additionalScript) additionalScript = '';

  (new Function(getFileText(path + '.js') + additionalScript + `//# sourceURL=${path}`)).call({});
}

let files = [
  'kango/api',
  'kango/backgroundscript_engine',
  'kango/browser',
  'kango/console',
  'kango/core',
  'kango/extension_info',
  'kango/invoke',
  'kango/i18n',
  'kango/io',
  'kango/invoke',
  'kango/invoke_async',
  'kango/lang',
  'kango/message_target',
  'kango/messaging',
  'kango/storage',
  'kango/storage_sync',
  'kango/timer',
  'kango/userscript_engine',
  'kango/utils',
  'kango/xhr',
  'kango-ui/browser_button',
  'kango-ui/context_menu',
  'kango-ui/notifications',
  'kango-ui/options'
];

requireKangoFile('kango/loader', 'window._kangoLoader = _kangoLoader;')

files.forEach((file) => {
  requireKangoFile(file);
})

// Loads the whole Kango API. Require caches, so the easiest way to grab it is to
// just require it again.
window.kango = _kangoLoader.require('kango/core').createApiInstance('kango');
