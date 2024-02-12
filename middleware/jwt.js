const jwt = require('jsonwebtoken')
const envConfig = require('../config/env.config')
const { fetchUser } = require('../mongodb/user.mongo')

exports.verifyToken = async (ctx, next) => {
  const token = ctx.cookies.get('token')
  const mongoClient = await ctx.dbClient;
  if (!token) {
    ctx.status = 401
    ctx.body = {
      message: 'Unauthorized'
    }
    return
  }
  const user = jwt.verify(token, envConfig.jwt_secret);
  if (!user) {
    ctx.status = 403
    ctx.body = {
      message: 'Invalid token'
    }
    return
  }

  const authUser = await fetchUser(mongoClient, user.id, null);
  if (!authUser) {
    ctx.status = 401
    ctx.body = {
      message: 'Unauthorized'
    }
    return
  }
  ctx.user = {
    id: authUser.userTag,
    role: authUser.role,
    sid: authUser.address?.society || null,
    wid: authUser.address?.wing || null,
    flat: authUser.address?.house || null
  };
  await next()
}