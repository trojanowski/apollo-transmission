const USER_SESSION_FIELD = 'userId';

export function login(ctx, user) {
  ctx.session[USER_SESSION_FIELD] = user.id;
}

export function logout(ctx) {
  delete ctx.session[USER_SESSION_FIELD];
}

export function getUserId(ctx) {
  return ctx.session[USER_SESSION_FIELD];
}
