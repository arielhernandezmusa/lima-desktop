import Docker from 'dockerode';
import { IpcMainEvent } from 'electron';

const docker = new Docker({
  socketPath: `${process.env.HOME}/.lima/lima-desktop/docker.sock`,
});

let dockerCommandInterval: NodeJS.Timer | null;

export const listContainers = (event: IpcMainEvent) => {
  if (!dockerCommandInterval) {
    dockerCommandInterval = setInterval(async () => {
      try {
        const containers = await docker.listContainers({ all: true });
        event.reply('docker-containers', containers);
      } catch (e) {
        // engine not ready yet
      }
    }, 3000);
  }
};

export const listImages = (event: IpcMainEvent) => {
  if (!dockerCommandInterval) {
    dockerCommandInterval = setInterval(async () => {
      try {
        const images = await docker.listImages({ all: true });
        event.reply('docker-images', images);
      } catch (e) {
        // engine not ready yet
      }
    }, 3000);
  }
};

export const startContainer = (id: string) => {
  docker.getContainer(id).start();
};

export const stopContainer = (id: string) => {
  docker.getContainer(id).stop();
};

export const cleanDockerInterval = () => {
  if (dockerCommandInterval) {
    clearInterval(dockerCommandInterval);
    dockerCommandInterval = null;
  }
};

export default docker;
