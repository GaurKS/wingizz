const KoaRouter = require('@koa/router')
const userRoute = require('./user.route')
const commentRoute = require('./comment.route')
const societyRoute = require('./society.route')
const postRoute = require('./post.route')
const requestRoute = require('./request.route')

const router = new KoaRouter({ prefix: '/api' })

router.use(userRoute);
router.use(societyRoute);
router.use(postRoute);
router.use(commentRoute);
router.use(requestRoute);


module.exports = router;