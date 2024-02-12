const { roles } = require("../utils/types.enum")

exports.isAdminOnly = async (ctx) => {
  if (ctx.user.role !== roles.A || ctx.user.wid !== ctx.params.wid) {
    return new Error('Forbidden')
  }
  return null;
}

exports.isSecretaryOnly = async (ctx) => {
  if (ctx.user.role !== roles.S || ctx.user.sid !== ctx.params.sid) {
    return new Error('Forbidden')
  }
  return null;
}

exports.isSecretary = async (ctx) => {
  if (ctx.user.role !== roles.S || ctx.user.sid !== ctx.request.body.society) {
    return new Error('Forbidden')
  }
  return null;
}

exports.isRootOnly = async (ctx) => {
  if (ctx.user.role !== roles.R) {
    return new Error('Forbidden')
  }
  return null;
}

