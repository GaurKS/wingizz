const KoaRouter = require('@koa/router')
const { validateUserRegisterBody, validateUserLoginBody, isUserUnique, validateRootUserBody } = require('../validator/user.validator');
const { registerUser, loginUser, registerRootUser } = require('../service/auth.service');
const validate = require('../middleware/validate');

const router = new KoaRouter();

router.post('/user/add/root', validateRootUserBody, validate([isUserUnique]), registerRootUser); // used to add root user by app-dmin
router.post('/user/register', validateUserRegisterBody, validate([isUserUnique]), registerUser); // used to register user via invite token
router.post('/user/login', validateUserLoginBody, loginUser); // used to login user

module.exports = router.routes();