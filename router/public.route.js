const KoaRouter = require('@koa/router');
const auth = require('./auth.route');
const society = require('./society.route');

const router = new KoaRouter()
router.use(auth);
router.use(society);

module.exports = router;
