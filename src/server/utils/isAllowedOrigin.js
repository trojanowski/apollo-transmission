import address from 'address';

const PORT = process.env.PORT || 3000;

let allowedOrigins;

if (process.env.ALLOWED_ORIGINS) {
  allowedOrigins = process.env.ALLOWED_ORIGINS.split(';');
}

if (!(allowedOrigins && allowedOrigins.length)) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'ALLOWED_ORIGINS environment variable is required in production'
    );
  } else {
    allowedOrigins = [`http://127.0.0.1:${PORT}`, `http://localhost:${PORT}`];
    const localIp = address.ip();
    if (localIp) {
      allowedOrigins.push(`http://${localIp}:${PORT}`);
    }
  }
}

const allowedHosts = new Set(
  allowedOrigins.map(origin => origin.replace(/^https?:\/\//, ''))
);
allowedOrigins = new Set(allowedOrigins);

export default function isAllowedOrigin(req) {
  return (
    // TODO: support proxies
    allowedHosts.has(req.headers.host) && allowedOrigins.has(req.headers.origin)
  );
}
