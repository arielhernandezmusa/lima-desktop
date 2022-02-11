import { exec } from 'child_process';
import { resolveBinPath } from './common';

const cmd = (command: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    exec(
      command,
      {
        env: {
          ...process.env,
          PATH: `${process.env.PATH}:${resolveBinPath()}`,
        },
      },
      (err, out) => {
        if (err) {
          reject(err);
        } else {
          resolve(out);
        }
      }
    );
  });
};

export default cmd;
