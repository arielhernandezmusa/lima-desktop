import { useEffect, useState } from 'react';
import ipcRenderer from 'renderer/utils/ipcRenderer';

type Setting = {
  cpus: number;
  memory: string;
  disk: string;
  availableCPUS: Array<any>;
  availableMemory: number;
};

const Settings = () => {
  const [info, setInfo] = useState<Setting | null>(null);
  const [selectedCPUS, setSelectedCPUS] = useState<number>(0);
  const [selectedMemory, setSelectedMemory] = useState<number>(0);
  useEffect(() => {
    ipcRenderer.on('read-settings', (arg: Setting) => {
      const memory: number = +arg.memory.replace('GB', '');

      console.log(arg);
      setInfo(arg);
      setSelectedCPUS(arg.cpus);
      setSelectedMemory(memory);
    });

    ipcRenderer.readSettings();

    return () => {
      ipcRenderer.clean('read-settings');
    };
  }, []);

  return (
    <div className="p-3">
      <h1 className="text-2xl">Settings</h1>
      <br />

      <div className="relative pt-1">
        <label htmlFor="cpus" className="form-label">
          CPU: {selectedCPUS}
          <input
            className="w-full"
            type="range"
            min={1}
            list="cpusMarks"
            max={info?.availableCPUS.length}
            step="1"
            value={selectedCPUS}
            onChange={(e) => setSelectedCPUS(+e.target.value)}
            id="cpus"
          />
        </label>
        <datalist id="cpusMarks">
          {Array.from(Array(info?.availableCPUS.length).keys()).map((item) => (
            <option value={item} label={`${item}`} />
          ))}
        </datalist>
      </div>
      <div className="relative pt-5 pb-5">
        <label htmlFor="memory">
          Memory: {selectedMemory}GB
          <input
            className="w-full"
            type="range"
            min={1}
            list="memoryMarkers"
            max={info?.availableMemory}
            step="1"
            value={selectedMemory}
            name="memory"
            onChange={(e) => setSelectedMemory(+e.target.value)}
            id="memory"
          />
          <datalist id="memoryMarkers">
            {Array.from(Array(info?.availableMemory).keys()).map((item) => (
              <option value={item + 1} key={item} label={`${item + 1}`} />
            ))}
          </datalist>
        </label>
      </div>
      <button
        type="button"
        onClick={() => {
          ipcRenderer.updateSettings({
            memory: selectedMemory,
            cpus: selectedCPUS,
          });
        }}
      >
        Update
      </button>
    </div>
  );
};

export default Settings;
