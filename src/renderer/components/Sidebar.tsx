import { Link } from 'react-router-dom';
import DockerInfo from 'renderer/DockerInfo';

const Sidebar = () => {
  return (
    <div className="bg-gray-800 w-44 flex flex-col text-white p-2">
      <div>asda</div>
      <div className="flex-grow">
        <Link to="/">Containers</Link> <br />
        <Link to="/images">Images</Link>
        <br />
        <Link to="/settings">Settings</Link>
        <br />
      </div>
      <div>
        <DockerInfo />
      </div>
    </div>
  );
};

export default Sidebar;
