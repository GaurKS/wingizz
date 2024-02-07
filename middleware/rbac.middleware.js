// rbac based auth middleware

const { rbac } = require('../config/rbac.config');

const rbacMiddleware = async (ctx, next) => {
  const user = ctx.state.user;
  const permission = ctx.request.method + ':' + ctx._matchedRoute;
  const allowed = await rbac.can(user.roles, permission);
  if (allowed) {
    await next();
  } else {
    ctx.status = 403;
    ctx.body = {
      message: 'Forbidden'
    }
  }
}