const KoaRouter = require('@koa/router')
const { getSociety, addResource, removeResource, createSociety, removeSociety } = require('../service/society.service');
const { isSocietyValid, isSocietyNew, validateSocietyRegisterBody, validateAddResourceBody } = require('../validator/society.validator');
const validate = require('../middleware/validate');
const { verifyToken } = require('../middleware/jwt');
const { isRootOnly, isSecretaryOnly } = require('../validator/access.validator');

const router = new KoaRouter();

// create society
router.post('/society/add', verifyToken, validateSocietyRegisterBody, validate([isRootOnly, isSocietyNew]), createSociety);

// get society details
router.get('/society/:sid', verifyToken, validate([isSocietyValid, isSecretaryOnly]), getSociety);

// add resources
router.patch('/society/edit/:sid/add', verifyToken, validateAddResourceBody, validate([isSocietyValid, isSecretaryOnly]), addResource);

// remove resources
router.patch('/society/edit/:sid/remove/:rid', verifyToken, validate([isSocietyValid, isSecretaryOnly]), removeResource);

// delete society
router.delete('/society/:sid/delete', verifyToken, validate([isSecretaryOnly]), removeSociety);

module.exports = router.routes();
