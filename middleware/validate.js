const Promise = require('bluebird');
const AppException = require('../exception/app.exception');

module.exports = (validators) => {
  return async (ctx, next) => {
    const errors = await Promise.mapSeries(validators, async (validator) => {
      return await validator(ctx);
    });
    const err = errors.filter(e => e !== null).map(e => e.message).join(', ');

    if (err.length > 0) {
      throw new AppException(`Validation error: ${err}`, err.split(', '), 400);
    }
    await next();
  }
}
