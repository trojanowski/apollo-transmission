const http = require('http');

const connect = require('connect');
const morgan = require('morgan');
const proxy = require('http-proxy-middleware');

const PORT = 3000;
const PROXY_TABLE = {
  '/sockjs-node/': 'http://localhost:3050',
  '/static/js/': 'http://localhost:3050',
  // for react-notifications font
  '/static/media/': 'http://localhost:3050',
};

const app = connect();

app.use(morgan('dev'));

app.use(
  proxy({
    router: PROXY_TABLE,
    target: 'http://localhost:3100',
    ws: true,
  })
);

http.createServer(app).listen(PORT);
