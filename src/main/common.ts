import { app } from 'electron';
import path from 'path';

export const resolveBinPath = (): string => {
  return app.isPackaged
    ? path.join(process.resourcesPath, '/assets/lima-and-qemu.macos/bin')
    : 'assets/lima-and-qemu.macos/bin';
};

export default resolveBinPath;
