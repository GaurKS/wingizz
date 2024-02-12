const KoaRouter = require('@koa/router');
const { verifyToken } = require('../middleware/jwt');
const validate = require('../middleware/validate');
const { isPostValid } = require('../validator/comment.validator');
const { isChannelValid, isChannelMember, isAuthorValid, validateCreatePostBody } = require('../validator/post.validator');
const { getPost, getAllPost, createPost, editPost, deletePost } = require('../service/post.service');

const router = new KoaRouter();

router.post('/channel/:cid/post', verifyToken, validateCreatePostBody, validate([isChannelValid, isChannelMember]), createPost);
router.get('channel/:cid/post/:pid', verifyToken, validate([isChannelValid, isChannelMember, isPostValid]), getPost);
router.get('/channel/:cid/post', verifyToken, validate([isChannelValid, isChannelMember]), getAllPost);
router.patch('/channel/:cid/post/:pid', verifyToken, validate([isChannelValid, isChannelMember, isPostValid, isAuthorValid]), editPost);
router.delete('/channel/:cid/post/:pid', verifyToken, validate([isChannelValid, isChannelMember, isPostValid, isAuthorValid]), deletePost);

module.exports = router.routes();

// TODO: post features
// edit media
// disable comments
// tag user in text
// notice post - will notify everyone
// add reactions to post
