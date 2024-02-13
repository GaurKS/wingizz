const KoaRouter = require('@koa/router');
const { verifyToken } = require('../middleware/jwt');
const { getComment, createComment, editComment, deleteComment, getAllComments, editCommentReaction } = require('../service/comment.service');
const validate = require('../middleware/validate');
const { isCommentValid, isUserValid, isPostValid, validateCommentBody, canEdit } = require('../validator/comment.validator');
const { isChannelValid, isChannelMember } = require('../validator/post.validator');

const router = new KoaRouter();

router.post('/comment/:pid/add/:cid', verifyToken, validateCommentBody, validate([isChannelValid, isChannelMember, isPostValid]), createComment);
router.get('/:cid/comment/:coid', verifyToken, validate([isChannelValid, isCommentValid, isUserValid]), getComment);
router.get('/:cid/post/:pid', verifyToken, validate([isChannelValid, isChannelMember, isUserValid]), getAllComments);
router.patch('/:cid/comment/:coid', verifyToken, validate([isChannelValid, isCommentValid, isUserValid, canEdit]), editComment);
router.delete('/comment/:coid', verifyToken, validate([isCommentValid, canEdit]), deleteComment);
router.patch('/:cid/comment/:coid/reaction', verifyToken, validate([isChannelValid, isChannelMember, isCommentValid]), editCommentReaction);

module.exports = router.routes();