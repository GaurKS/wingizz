const KoaRouter = require('@koa/router')
const { addSociety } = require('../service/society.service');

const router = new KoaRouter({
  prefix: '/api/society'
})

router.post('/add', addSociety);

module.exports = router.routes();
