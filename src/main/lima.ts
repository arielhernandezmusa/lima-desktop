import path from 'path';
import { app } from 'electron';
import { exec } from 'child_process';
import fs from 'fs';
import cmd from './cmd';
import { resolveBinPath } from './common';

const VM_NAME = 'lima-desktop';

const resolveLimaConfiguration = (): string => {
  return app.isPackaged
    ? path.join(process.resourcesPath, '/assets/lima-desktop.yml')
    : 'assets/lima-desktop.yml';
};

const resolveLimaPath = (): string => {
  return app.isPackaged
    ? path.join(
        process.resourcesPath,
        '/assets/lima-and-qemu.macos/bin/limactl'
      )
    : 'assets/lima-and-qemu.macos/bin/limactl';
};

const lima = async (arg: string): Promise<any> =>
  new Promise((resolve, reject) => {
    exec(
      `${resolveLimaPath()} ${arg}`,
      {
        env: {
          ...process.env,
          PATH: `${process.env.PATH}:${resolveBinPath()}`,
        },
      },
      (err, out) => {
        if (err) {
          reject(err);
        }

        resolve(out);
      }
    );
  });

export const stop = async () => {
  await lima(`stop ${VM_NAME}`);
  await cmd(`docker context use default && docker context rm ${VM_NAME}`);
};

export const start = async () => {
  await lima(`start ${VM_NAME}`);
  try {
    await cmd(
      `docker context create ${VM_NAME} --docker "host=unix://${process.env.HOME}/.lima/${VM_NAME}/docker.sock"`
    );
  } catch (e) {
    console.log(e);
  }

  try {
    await cmd(`docker context use ${VM_NAME}`);
  } catch (e) {
    console.log(e);
  }
};

const downloadRequiredTools = async () => {};

export const init = async () => {
  const config = resolveLimaConfiguration();
  const listResult = await lima(`list ${VM_NAME} --json`);

  let fileContent = fs.readFileSync(config, 'utf8');
  fileContent = fileContent.replace(/##USER##/g, process.env.USER || '');
  fs.writeFileSync(config, fileContent, 'utf8');

  let existVm = true;
  if (!listResult) {
    existVm = false;
  }

  if (!existVm) {
    await lima(`start ${config} --tty=false`);
  } else {
    await lima(`start ${VM_NAME}`);
  }

  try {
    await lima(
      `copy ${VM_NAME}:/tmp/k3s.yml ${process.env.HOME}/.lima/${VM_NAME}/k3s.yml`
    );
  } catch (e) {
    console.log(e);
  }

  try {
    await cmd(
      `docker context create ${VM_NAME} --docker "host=unix://${process.env.HOME}/.lima/${VM_NAME}/docker.sock"`
    );
  } catch (e) {
    console.log(e);
  }

  try {
    await cmd(`docker context use ${VM_NAME}`);
  } catch (e) {
    console.log(e);
  }
};
