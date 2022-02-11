import { useEffect, useState } from 'react';
import ipcRenderer from 'renderer/utils/ipcRenderer';

const Containers = () => {
  const [constainers, setContainers] = useState<Array<any>>();

  useEffect(() => {
    ipcRenderer.on('docker-containers', (arg: Array<any>) => {
      console.log(arg);
      setContainers(arg);
    });

    ipcRenderer.dockerCommand({ command: 'containers' });

    return () => {
      ipcRenderer.dockerCommand({ command: 'clean' });
      ipcRenderer.clean('docker-containers');
    };
  }, []);

  return (
    <div>
      <h1 className="text-2xl">Containers</h1>
      {!constainers && <div>loading</div>}
      {constainers?.map((item) => (
        <div key={item.Id}>
          {item.State === 'running' && (
            <div className="w-3 h-3 bg-green-600 rounded-full float-left">
              &nbsp;
            </div>
          )}
          {item.State === 'exited' && (
            <div className="w-3 h-3 bg-red-600 rounded-full float-left">
              &nbsp;
            </div>
          )}
          {item.Names[0].replace('/', '')} {item.State} {item.Image}
          <button
            type="button"
            onClick={() => {
              ipcRenderer.dockerCommand({
                command: 'start-container',
                id: item.Id,
              });
            }}
          >
            start
          </button>
          <button
            type="button"
            onClick={() => {
              ipcRenderer.dockerCommand({
                command: 'stop-container',
                id: item.Id,
              });
            }}
          >
            stop
          </button>
        </div>
      ))}
    </div>
  );
};

export default Containers;
