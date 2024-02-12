const KoaRouter = require('@koa/router')
const { validateEditUserBody, valiateInviteLinkBody } = require('../validator/user.validator');
const { editUser, createInviteLink } = require('../service/auth.service');
const { verifyToken } = require('../middleware/jwt');
const validate = require('../middleware/validate');
const { isSecretary } = require('../validator/access.validator');

const router = new KoaRouter()

router.post('/invite/create', verifyToken, valiateInviteLinkBody, validate([isSecretary]), createInviteLink);
router.patch('/user/edit/:tag', verifyToken, validateEditUserBody, editUser);

module.exports = router.routes();