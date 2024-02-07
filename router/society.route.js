const KoaRouter = require('@koa/router')
const { addSociety, getSociety } = require('../service/society.service');
const Validate = require('../middleware/validate');
// const { isUserEmailValid, isUserTagValid } = require('../validator/isUserValid');


const router = new KoaRouter({
  prefix: '/api/society'
})

router.get('/get/:sid', getSociety);
router.post('/add', addSociety);
// router.put('/edit', editSociety);
// router.delete('/delete', deleteSociety);




// router.post('/test', Validate([isUserEmailValid, isUserTagValid]), async (ctx) => {
//   ctx.body = "Test";
// });

module.exports = router.routes();
