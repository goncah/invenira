import { spawn } from 'child_process';

module.exports = async function () {
  if (globalThis.__SERVER_PROCESS__) {
    globalThis.__SERVER_PROCESS__.kill();
  }

  await new Promise((resolve, reject) => {
    const docker = spawn(
      'docker',
      ['compose', '-f', 'docker-compose-e2e.yaml', 'down', '--volumes'],
      {
        shell: true,
        stdio: 'pipe',
      },
    );

    docker.on('error', (err) => {
      reject(`Docker error: ${err}`);
    });

    docker.on('close', (err) => {
      resolve('');
    });
  });
};
