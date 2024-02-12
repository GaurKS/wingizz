const KoaRouter = require('@koa/router');
const { verifyToken } = require('../middleware/jwt');
const { getComment, createComment, editComment, deleteComment } = require('../service/comment.service');
const validate = require('../middleware/validate');
const { isCommentValid, isUserValid, isPostValid, validateCommentBody, canEdit } = require('../validator/comment.validator');

const router = new KoaRouter();

router.get('/comment/:cid', verifyToken, validate([isCommentValid, isUserValid]), getComment);
router.post('/comment/:pid/add/:cid', verifyToken, validateCommentBody, validate([isPostValid]), createComment);
router.patch('/comment/:cid', verifyToken, validate([isCommentValid, isUserValid, isPostValid, canEdit]), editComment);
router.delete('/comment/:cid', verifyToken, validate([isCommentValid, canEdit]), deleteComment);

module.exports = router.routes();