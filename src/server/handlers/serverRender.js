// based on https://codeburst.io/dont-use-nodemon-there-are-better-ways-fc016b50b45e

import path from 'path';

let handler;

if (process.env.NODE_ENV === 'production') {
  handler = require('./serverRenderBase').default;
} else {
  const SHARED_DIR_PATH = path.join(__dirname, '../../shared/');
  const chokidar = require('chokidar');

  const watcher = chokidar.watch(SHARED_DIR_PATH);

  watcher.on('ready', () => {
    watcher.on('all', () => {
      console.log('Clearing shared modules cache from server');
      delete require.cache[require.resolve('./serverRenderBase')];

      Object.keys(require.cache).forEach(id => {
        if (id.startsWith(SHARED_DIR_PATH)) {
          delete require.cache[id];
        }
      });
    });
  });

  handler = (...args) => {
    const originalHandler = require('./serverRenderBase').default;
    return originalHandler(...args);
  };
}

export default handler;
