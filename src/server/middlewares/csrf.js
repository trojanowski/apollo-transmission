import isAllowedOrigin from '../utils/isAllowedOrigin';

const SAFE_METHODS = new Set(['OPTIONS', 'GET', 'HEAD']);

export default function csrf() {
  return function middleware(ctx, next) {
    if (!SAFE_METHODS.has(ctx.request.method) && !isAllowedOrigin(ctx.req)) {
      ctx.throw(400, 'Invalid origin');
    }
    return next();
  };
}
