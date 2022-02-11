import { useEffect, useState } from 'react';
import ipcRenderer from 'renderer/utils/ipcRenderer';

const Images = () => {
  const [images, setImages] = useState<Array<any>>();

  useEffect(() => {
    console.log('asdasd');
    ipcRenderer.on('docker-images', (arg: Array<any>) => {
      console.log(arg);
      setImages(arg);
    });

    ipcRenderer.dockerCommand({ command: 'images' });

    return () => {
      ipcRenderer.dockerCommand('clean');
      ipcRenderer.clean('docker-images');
    };
  }, []);
  return <div>Images</div>;
};

export default Images;
