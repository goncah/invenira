import axios from 'axios';

module.exports = async function () {
  const host = process.env.HOST ?? 'localhost';
  const port = process.env.PORT ?? '3000';
  axios.defaults.baseURL = `http://${host}:${port}`;
  axios.defaults.headers.get['Authorization'] =
    `Bearer ${globalThis.__TOKEN__}`;
  axios.defaults.headers.post['Authorization'] =
    `Bearer ${globalThis.__TOKEN__}`;
  axios.defaults.headers.patch['Authorization'] =
    `Bearer ${globalThis.__TOKEN__}`;
  axios.defaults.headers.delete['Authorization'] =
    `Bearer ${globalThis.__TOKEN__}`;
};
