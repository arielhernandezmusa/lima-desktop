import { useEffect, useState } from 'react';
import { MemoryRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { FaBeer } from 'react-icons/fa';
import { AiFillSetting } from 'react-icons/ai';

import './App.css';
import Sidebar from './components/Sidebar';
import Containers from './pages/Containers';
import Images from './pages/Images';
import Settings from './pages/Settings';
import ipcRenderer from './utils/ipcRenderer';

export default function App() {
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

  if (!info?.isReady) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-stone-300">
        <div className="w-4 h-4 animate-bounce bg-blue-400 shadow rounded-full mr-3" />
        Starting Lima Desktop ...
      </div>
    );
  }

  return (
    <Router>
      <div className="h-screen w-screen flex flex-col bg-stone-300">
        <div className="w-screen bg-slate-800 h-7 text-gray-300 flex items-center pr-3 pl-20">
          <Link to="/containers">Containers</Link>

          <button className="btn" type="button">
            Images
          </button>
          <div className="flex-grow" />
          <button className="cursor-pointer" type="button">
            <AiFillSetting className="text-2xl cursor-pointer" />
          </button>
        </div>
        <h1>Containers</h1>
      </div>
    </Router>
    // <div className="pt-6">sdfsdfd {(info?.isReady && 'ready') || 'stoped'}</div>
    // <Router>
    //   <div className="flex flex-row h-screen pt-8">
    //     <Sidebar />
    //     <div className="flex-grow">
    //       <Routes>
    //         <Route path="/" element={<Containers />} />
    //         <Route path="/images" element={<Images />} />
    //         <Route path="/settings" element={<Settings />} />
    //       </Routes>
    //     </div>
    //   </div>
    // </Router>
  );
}
