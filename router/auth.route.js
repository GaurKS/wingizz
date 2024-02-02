const KoaRouter = require('@koa/router')
const { validateUserRegisterBody, validateUserLoginBody } = require('../validator/user.validator');
const { registerUser, loginUser } = require('../service/auth.service');

const router = new KoaRouter({
  prefix: '/api/auth'
})

router.post('/user/register', validateUserRegisterBody, registerUser);
router.post('/user/login', validateUserLoginBody, loginUser);

module.exports = router.routes();