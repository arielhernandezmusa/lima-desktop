import { useEffect, useState } from 'react';
import ipcRenderer from './utils/ipcRenderer';

const DockerInfo = () => {
  const [info, setInfo] =
    useState<{ isReady: boolean; version: string | null }>();

  useEffect(() => {
    ipcRenderer.on('docker-status', (arg: any) => {
      setInfo(arg);
    });

    const interval = setInterval(() => {
      ipcRenderer.dockerStatus();
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, []);
  return (
    <div className="flex flex-row items-center w-full">
      <div>
        {(info && info.isReady && (
          <span className="flex h-3 w-3  bg-green-600 rounded-full">
            <span className="h-3 w-3 animate-ping rounded-full bg-green-600" />
          </span>
        )) || (
          <span className="flex h-3 w-3  bg-red-600 rounded-full">
            <span className="h-3 w-3 animate-ping rounded-full bg-red-600" />
          </span>
        )}
      </div>

      <div className="text-xs text-gray-400">
        &nbsp;&nbsp;Docker engine
        {(info?.isReady && info.version) || 'starting'}
      </div>
    </div>
  );
};

export default DockerInfo;
