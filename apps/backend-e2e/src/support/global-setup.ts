import { spawn } from 'child_process';
import jwt from 'jsonwebtoken';

module.exports = async function () {
  console.log('\nSetting up...\n');

  await new Promise((resolve, reject) => {
    const docker = spawn(
      'docker',
      ['compose', '-f', 'docker-compose-e2e.yaml', 'up'],
      {
        shell: true,
        stdio: 'pipe',
      },
    );

    docker.stdout.on('data', (data) => {
      process.stdout.write(`${data}\n`);
      if (
        data
          .toString()
          .includes('"ctx":"initandlisten","msg":"mongod startup complete"')
      ) {
        resolve(docker);
      }
    });

    docker.on('error', (err) => {
      reject(`Docker error: ${err}`);
    });
  });

  const customEnv = { ...process.env, OAUTH_KEY: '123456789' };

  globalThis.__SERVER_PROCESS__ = await new Promise((resolve, reject) => {
    const server = spawn('nx', ['run', 'backend:serve'], {
      shell: true,
      stdio: 'pipe',
      env: customEnv,
    });

    server.stdout.on('data', (data) => {
      process.stdout.write(`${data}\n`);
      if (data.toString().includes(' Main: Started in ')) {
        resolve(server);
      }
    });

    server.stderr.on('data', (data) => {
      process.stderr.write(`${data}\n`);
    });

    server.on('error', (err) => {
      reject(`Backend error: ${err}`);
    });
  });

  globalThis.__TOKEN__ = jwt.sign(
    {
      preferred_username: 'testAdmin',
      realm_access: {
        roles: ['app_admin'],
      },
      azp: '...',
    },
    '123456789',
    {
      expiresIn: '1h',
      issuer: 'test',
    },
  );
};
