const KoaRouter = require('@koa/router')
const user = require('./user.route')

const router = new KoaRouter()
router.use(user)

module.exports = router