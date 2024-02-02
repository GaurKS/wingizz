const KoaRouter = require('@koa/router')
const { validateEditUserBody } = require('../validator/user.validator');
const { editUser } = require('../service/auth.service');

const router = new KoaRouter({
  prefix: '/api/auth'
})

router.patch('/user/edit/:tag', validateEditUserBody, editUser);

module.exports = router.routes();