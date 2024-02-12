const KoaRouter = require('@koa/router');
const authRoute = require('./auth.route');
const society = require('./society.route');

const router = new KoaRouter({ prefix: '/api' })

router.use(authRoute);

module.exports = router;
