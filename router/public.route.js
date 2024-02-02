const KoaRouter = require('@koa/router')
const auth = require('./auth.route')

const router = new KoaRouter()
router.use(auth)

module.exports = router