/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import os from 'os';

import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { init, stop } from './lima';
import docker, {
  cleanDockerInterval,
  listContainers,
  listImages,
  startContainer,
  stopContainer,
} from './docker';
import { readSettings, updateSettings } from './settings';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.on('read-settings', (event, arg) => {
  const { cpus, memory, disk } = readSettings();

  const totalMemory = os.totalmem();
  let totalMemInKb = totalMemory / 1024;
  let totalMemInMb = totalMemInKb / 1024;
  let totalMemInGb = totalMemInMb / 1024;

  totalMemInKb = Math.floor(totalMemInKb);
  totalMemInMb = Math.floor(totalMemInMb);
  totalMemInGb = Math.floor(totalMemInGb);

  event.reply('read-settings', {
    cpus,
    memory,
    disk,
    availableCPUS: os.cpus(),
    availableMemory: totalMemInGb,
  });
});

ipcMain.on('update-settings', (event, arg) => {
  updateSettings(arg);
});

ipcMain.on('docker-status', async (event, arg) => {
  try {
    const info: any = await docker.info();
    event.reply('docker-status', {
      isReady: true,
      version: info.ServerVersion,
    });
  } catch (e) {
    event.reply('docker-status', { isReady: false, version: null });
  }
});

ipcMain.on('docker-command', (event, arg) => {
  switch (arg.command) {
    case 'containers':
      listContainers(event);
      break;

    case 'images':
      listImages(event);
      break;

    case 'start-container':
      startContainer(arg.id);
      break;

    case 'stop-container':
      stopContainer(arg.id);
      break;

    default:
      cleanDockerInterval();
  }
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDevelopment) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDevelopment) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 800,
    height: 600,
    minHeight: 600,
    minWidth: 800,
    titleBarStyle: 'hidden',
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  // new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async (e) => {
  e.preventDefault();
  await stop();
  app.exit();
  app.quit();
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });

    init();
  })
  .catch(console.log);
