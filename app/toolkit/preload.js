// Set up a Chrome proxy so that any calls to the Chrome API will
// just do nothing instead of causing errors.
window.chrome = () => {};
window.chrome.extension = () => {};
window.chrome.extension.getBackgroundPage = () => { return window; };

window._kangoLoader = () => {};
window._kangoLoader.require = () => {
  var requireResult = {
    createApiInstance: () => {
      return {
        obj: () => {}
      }
    },
    object: []
  };

  requireResult.object.freeze = () => {};

  return requireResult;
};
