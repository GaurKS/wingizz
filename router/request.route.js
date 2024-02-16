const KoaRouter = require('@koa/router');
const { verifyToken } = require('../middleware/jwt');
const validate = require('../middleware/validate');
const { deleteRequest, editRequest, createRequest, getRequest, getAllRequest } = require('../service/request.service');
const { isChannelMember, isChannelValid } = require('../validator/post.validator');
const { validateCreateRequestBody, isRequestValid, isAdmin, validateEditRequestBody, isResourceAllowed, isRequestAllowed } = require('../validator/request.validator');

const router = new KoaRouter();

router.get('/channel/:cid/request', verifyToken, validate([isChannelValid, isChannelMember]), getAllRequest);
router.get('/channel/:cid/request/:rid', verifyToken, validate([isChannelValid, isChannelMember, isRequestValid, isRequestAllowed]), getRequest);
router.post('/channel/:cid/request', verifyToken, validateCreateRequestBody, validate([isChannelValid, isChannelMember, isResourceAllowed]), createRequest)
router.patch('/channel/:cid/request/:rid/status', verifyToken, validateEditRequestBody, validate([isChannelValid, isChannelMember, isRequestValid, isAdmin]), editRequest);
router.delete('/channel/:cid/request/:rid', verifyToken, validate([isChannelValid, isChannelMember, isRequestValid]), deleteRequest);

module.exports = router.routes();