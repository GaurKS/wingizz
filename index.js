const Koa = require('koa');
const koaHelmet = require('koa-helmet');
const envConfig = require('./config/env.config');
const logger = require('./config/winston.config');
const { dbInit, dbClient } = require('./config/db.config');
const koaBodyParser = require('koa-bodyparser');
const KoaLogger = require('koa-logger');
const json = require('koa-json');
const ExceptionHandler = require('./middleware/exceptionHandler');
const publicRoutes = require('./router/public.route');
const privateRoutes = require('./router/private.route');


const run = async () => {
  const app = new Koa();
  dbInit().then(app.context.dbClient = dbClient()).catch((err) => { logger.error(err) })
  app.use(ExceptionHandler())
  app.use(json())
  app.use(koaBodyParser())
  app.use(koaHelmet())
  app.use(KoaLogger((str) => { logger.info(str) }))
  app.use(publicRoutes.routes())
  app.use(publicRoutes.allowedMethods())
  app.use(privateRoutes.routes())
  app.use(privateRoutes.allowedMethods())

  app.listen(envConfig.port, () =>
    logger.info(`Application running on port ${envConfig.port}`)
  );
}

run();