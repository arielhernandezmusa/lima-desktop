const { exec } = require('child_process');
const fs = require('fs');
const fetch = require('node-fetch');

const downloadFile = async (url, path) => {
  const res = await fetch(url);
  const fileStream = fs.createWriteStream(path);
  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on('error', reject);
    fileStream.on('finish', resolve);
  });
};

const downloadAndUntar = async () => {
  await downloadFile(
    'https://download.docker.com/mac/static/stable/x86_64/docker-20.10.9.tgz',
    'prueba/docker.tgz'
  );
  await downloadFile(
    'https://dl.k8s.io/release/v1.23.0/bin/darwin/amd64/kubectl',
    'prueba/kubectl'
  );

  await downloadFile(
    'https://github.com/rancher-sandbox/lima-and-qemu/releases/download/v1.19/lima-and-qemu.macos.tar.gz',
    'prueba/prueba.tgz'
  );

  exec('tar -xvf prueba/prueba.tgz -C prueba', () => {});
  exec('tar -xvf prueba/docker.tgz -C prueba', () => {});
};

downloadAndUntar();
