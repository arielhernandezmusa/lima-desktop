const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    myPing() {
      ipcRenderer.send('ipc-example', 'ping');
    },
    dockerStatus() {
      ipcRenderer.send('docker-status');
    },
    dockerCommand(command) {
      ipcRenderer.send('docker-command', command);
    },
    readSettings() {
      ipcRenderer.send('read-settings');
    },
    updateSettings(args) {
      ipcRenderer.send('update-settings', args);
    },
    on(channel, func) {
      const validChannels = [
        'ipc-example',
        'docker-status',
        'docker-containers',
        'docker-images',
        'read-settings',
      ];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    once(channel, func) {
      const validChannels = [
        'ipc-example',
        'docker-status',
        'docker-containers',
        'docker-images',
        'read-settings',
      ];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.once(channel, (event, ...args) => func(...args));
      }
    },
    clean(name) {
      ipcRenderer.removeAllListeners(name);
    },
  },
});
