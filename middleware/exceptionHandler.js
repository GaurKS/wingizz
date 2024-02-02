const MongoError = require('mongodb')
const logger = require('../config/winston.config')
const AppException = require('../exception/app.exception')
const { createErrorResponse } = require('../utils/createResponse')
const { ValidationError } = require('joi')


module.exports = () => {
  return async (ctx, next) => {
    try {
      await next()
    } catch (error) {
      logger.error(error.message)

      if (error instanceof AppException) {
        ctx.status = error.httpStatusCode
        ctx.body = createErrorResponse(ctx.originalUrl, ctx.method, error.httpStatusCode, error.clientMessage)
      }
      else if (error instanceof MongoError.MongoNetworkTimeoutError) {
        ctx.status = 503
        ctx.body = createErrorResponse(ctx.originalUrl, ctx.method, 400, error.message)
      }
      else if (error instanceof MongoError.MongoNetworkError) {
        ctx.status = 503
        ctx.body = createErrorResponse(ctx.originalUrl, ctx.method, 503, 'Service is unavailable. Try again later.')
      }
      else if (error instanceof ValidationError) {
        ctx.status = 400
        ctx.body = createErrorResponse(ctx.originalUrl, ctx.method, 400, error.message)
      }
      else {
        ctx.status = 500
        ctx.body = createErrorResponse(ctx.originalUrl, ctx.method, 500, 'Something went wrong. Try again later.')
      }
    }
  }
}

