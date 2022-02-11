import yaml from 'js-yaml';
import fs from 'fs';
import { start, stop } from './lima';

export const readSettings = (): any => {
  const doc = yaml.load(
    fs.readFileSync(`${process.env.HOME}/.lima/lima-desktop/lima.yaml`, 'utf8')
  );

  return doc;
};

export const updateSettings = async (arg: { memory: number; cpus: number }) => {
  const settings = readSettings();
  settings.memory = `${arg.memory}GB`;
  settings.cpus = arg.cpus;

  const newSettings = yaml.dump(settings);

  fs.writeFileSync(
    `${process.env.HOME}/.lima/lima-desktop/lima.yaml`,
    newSettings,
    { encoding: 'utf-8' }
  );

  await stop();
  await start();
};
